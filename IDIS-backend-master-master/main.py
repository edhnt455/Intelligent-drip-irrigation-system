#!/usr/bin/env python
# -*- coding:UTF-8 -*-
import time
import datetime  # 导入时间
import os
import json
import subprocess  # 查询状态
import requests
import numpy as np
from warnings import simplefilter
import seeed_dht  # 温湿度传感器
from grove.grove_light_sensor_v1_2 import GroveLightSensor  # 光敏传感器
from grove.grove_moisture_sensor import GroveMoistureSensor  # 土壤湿度传感器
from grove.factory import Factory  # 继电器
from picamera import PiCamera  # 拍照
from multiprocessing import Process  # 多进程
from db import DB
import skfuzzy as fuzz
import skfuzzy.control as ctrl
import schedule
from app import app


def start_flask():  # 开启flask后端
    app.run(host='0.0.0.0')


# 通知
def notice(content):
    api = "http://iyuu.cn/" + iyuu_key + ".send"
    title = "滴灌系统出问题啦！！！"
    data = {
        "text": title,
        "desp": content
    }
    requests.post(api, data=data)


# 天气预报
def get_weather(city):
    url = 'http://wthrcdn.etouch.cn/weather_mini?city=' + city
    resp = requests.get(url)
    return json.loads(resp.text)


# 上传图片
def upload_photo(pic, pic_type):
    localfile = '/home/pi/Pictures/' + pic
    fp = open(localfile)
    img = fp.read()
    fp.close()
    db.insert_pic(userid, img, pic_type)


# 拍照
def take_pic():
    print('Taking picture!')
    camera = PiCamera()
    camera.resolution = (1024, 768)
    camera.framerate = 15
    camera.start_preview()
    time.sleep(2)
    tim = time.strftime("%m-%d-%H.%M", time.localtime())
    name = tim + '.jpg'
    path = '/home/pi/Pictures/' + name
    camera.capture(path)
    camera.close()
    return name


# 获取CPU温度
def getCPUtemperature():
    return os.popen('/opt/vc/bin/vcgencmd measure_temp').read()[5:9]


# 获取CPU占用率
def getCPUuse():
    cmd = "top -bn1 | grep load | awk '{printf \"%.2f\", $(NF-2)}'"
    CPU = subprocess.check_output(cmd, shell=True)
    a = float(CPU.decode())
    a = a / 4 * 100
    a = int(a)
    return a


# 获取内存信息
def getRAMinfo():
    ps = os.popen('free')
    i = 0
    while 1:
        i = i + 1
        line = ps.readline()
        if i == 2:
            a = line.split()[1:4]
            result = round(int(a[2]) / 1000, 1)
            return result


# 获取硬盘信息
def getDiskSpace():
    ps = os.popen("df -h /")
    i = 0
    while True:
        i = i + 1
        line = ps.readline()
        if i == 2:
            result = line.split()[1:5]
            result = result[3]
            result = result[:-1]
            return result


# 系统异常
def security():
    CPU_temp = int(float(getCPUtemperature()))
    CPU_usage = getCPUuse()
    RAM_free = int(getRAMinfo())
    DISK_perc = int(getDiskSpace())
    water_state = db.get_data(userid, 'water_state')
    if water_state == '1':
        notice('水箱水量不足！')
        # sys.exit(0)
    if CPU_temp > 75:
        notice('CPU温度过高！')
        # sys.exit(0)
    if CPU_usage > 85:
        notice('CPU占用过高！')
        # sys.exit(0)
    if RAM_free < 500:
        notice('内存不足')
        # sys.exit(0)
    if DISK_perc > 85:
        notice('硬盘空间不足')
        # sys.exit(0)


def fuzzy(light, humidity):
    # 光照强度，土壤湿度差值，电磁阀开启时长
    x_light_range = np.arange(1, 8, 1, np.float32)
    x_humidity_range = np.arange(1, 5, 1, np.float32)
    y_elc_range = np.arange(1, 5, 1, np.float32)
    # 创建模糊控制变量
    x_light = ctrl.Antecedent(x_light_range, 'light')
    x_humidity = ctrl.Antecedent(x_humidity_range, 'humidity')
    y_elc = ctrl.Consequent(y_elc_range, 'elc')
    # 定义模糊集和其隶属度函数
    x_light['N'] = fuzz.trimf(x_light_range, [1, 1, 5])
    x_light['M'] = fuzz.trimf(x_light_range, [2, 5, 10])
    x_light['P'] = fuzz.trimf(x_light_range, [5, 10, 10])
    x_humidity['N'] = fuzz.trimf(x_humidity_range, [1, 3, 5])
    x_humidity['M'] = fuzz.trimf(x_humidity_range, [3, 5, 7])
    x_humidity['P'] = fuzz.trimf(x_humidity_range, [5, 7, 10])
    y_elc['N'] = fuzz.trimf(y_elc_range, [1, 1, 5])
    y_elc['M'] = fuzz.trimf(y_elc_range, [1, 5, 10])
    y_elc['P'] = fuzz.trimf(y_elc_range, [5, 10, 10])
    # 设定输出elc的解模糊方法——质心解模糊方式
    y_elc.defuzzify_method = 'centroid'
    # 输出为N的规则
    rule0 = ctrl.Rule(antecedent=((x_light['N'] & x_humidity['N']) |
                                  (x_light['M'] & x_humidity['N'])),
                      consequent=y_elc['N'], label='rule N')
    # 输出为M的规则
    rule1 = ctrl.Rule(antecedent=((x_light['P'] & x_humidity['N']) |
                                  (x_light['N'] & x_humidity['M']) |
                                  (x_light['M'] & x_humidity['M']) |
                                  (x_light['P'] & x_humidity['M']) |
                                  (x_light['N'] & x_humidity['P'])),
                      consequent=y_elc['M'], label='rule M')
    # 输出为P的规则
    rule2 = ctrl.Rule(antecedent=((x_light['M'] & x_humidity['P']) |
                                  (x_light['P'] & x_humidity['P'])),
                      consequent=y_elc['P'], label='rule P')
    # 系统和运行环境初始化
    system = ctrl.ControlSystem(rules=[rule0, rule1, rule2])
    sim = ctrl.ControlSystemSimulation(system)
    sim.input['light'] = light
    sim.input['humidity'] = humidity
    sim.compute()  # 运行系统
    output_elc = sim.output['elc']
    # 返回输出结果
    return int(output_elc)


# 自动浇水
def automate():
    thresh = 1000
    low_thresh = 500
    high_light = 300
    schedule.every().hour.do(automate)
    print("开始执行自动浇水。。。")
    automate_state = db.get_data(userid, 'automate_state')
    if automate_state == '1':
        moi = sensor()[3]
        light = sensor()[2]
        data = get_weather(city)
        data1 = data['data']['forecast'][0]  # 获取当天的天气预报
        print('土壤湿度为' + str(moi))
        if data1['type'].find('x雨') == -1:  # 如果没有雨执行自动浇水
            if moi < thresh:
                print('开始浇水....')
                relay.on()
                db.up_system(userid, 'motor_state', '1')
                # 这里需映射数据1-10
                mois = int((thresh - moi) / (thresh - low_thresh)) * 10  # 干燥程度
                lights = int((high_light - light) / high_light) * 10  # 光照强度
                print(mois,lights)
                open_length = 20 * fuzzy(lights, mois)
                print('需浇水' + str(open_length) + '秒')
                time.sleep(open_length)
                relay.off()
                print('浇水完毕')
                db.up_system(userid, 'motor_state', '0')
                moi2 = sensor()[3]
                print('现在土壤湿度为' + str(moi2))
                if moi2 <= moi:
                    db.up_system(userid, 'water_state', '1')
                else:
                    db.insert_plantsdb(userid, open_length)
            else:
                print("湿度合适不用浇水")
        else:  # 有雨就不浇水
            print('今日有雨不浇水！！！')
            relay.off()
            db.up_system(userid, 'motor_state', '0')
    else:
        print('自动模式关闭')


# 传感器
def sensor():
    # 引脚位置
    dht_pin = 26
    light_pin = 2
    moisture_pin = 0
    # 温湿度传感器
    dhtsensor = seeed_dht.DHT("11", dht_pin)
    hum, temp = dhtsensor.read()
    # 光敏传感器
    lightsensor = GroveLightSensor(light_pin)
    light = int(lightsensor.light * 100 / 1023)
    # 土壤湿度传感器
    moisensor = GroveMoistureSensor(moisture_pin)
    moi = moisensor.moisture
    return hum, temp, light, moi


# 手机app选项连接功能
def phone():
    global initTime
    # update = db.get_data(userid, 'up')
    automate_state = db.get_data(userid, 'automate_state')
    take_photo = db.get_data(userid, 'take_photo')
    motor_state = db.get_data(userid, 'motor_state')
    initTime = time.time()
    # 获取传感器数值
    minute = datetime.datetime.now().strftime("%M")
    hour = int(datetime.datetime.now().strftime("%H"))
    if hour % 4 == 0 and minute == "00":  # 每4小时保存数据
        print("开始保存环境数据")
        humidity, temperature, light, moisture = sensor()
        if humidity == 0 or temperature == 0:
            time.sleep(10)
            humidity, temperature, light, moisture = sensor()
        db.insert_date(userid, humidity, temperature, light, moisture / 10)
        time.sleep(61)

    # if update == '1':  # 更新传感器数值到数据库
    #     print("updating db")
    #     # db.up_plant(userid, 'CPU_Temperature', str(getCPUtemperature()) + '℃')
    #     # db.up_plant(userid, 'RAM_Free', str(getRAMinfo()) + 'MB')
    #     db.up_system('temperature', str(temperature) + '℃')
    #     db.up_system('humidity', str(humidity) + '%RH')
    #     db.up_system('light', str(light) + 'lx')
    #     db.up_system('moisture', str(moisture))
    #     db.up_system(userid, 'up', '0')
    #     time.sleep(61)

    if take_photo == '1':
        photo = take_pic()
        upload_photo(photo, 1)  # 上传拍摄的植物状态照片
        db.up_system(userid, 'take_photo', '0')

    if automate_state == '1':
        # print('自动模式工作中......')
        pass

    elif motor_state == '1':  # turn on motor
        print("手动浇水中......")
        relay.on()
        print('打开电磁阀')

    elif motor_state == '0':  # turn off motor
        print("手动关闭浇水")
        relay.off()
        print('关闭电磁阀')


if __name__ == '__main__':
    db = DB()
    userid = 1
    iyuu_key = 'IYUU1387T2fb7ace59ac325bbb23a3283f8d0984068e50291'
    city = '上海'
    relay = Factory.getGpioWrapper("Relay", 18)
    initTime = time.time()
    db.up_system(userid, 'automate_state', '1')
    db.up_system(userid, 'water_state', '0')
    p = Process(target=automate)    # 多线程
    p.daemon = True
    p.start()  # 默认打开自动模式
    q = Process(target=start_flask)
    q.daemon = True
    q.start()  # 开启flask进程
    print('自动模式工作中......')
    simplefilter(action='ignore', category=FutureWarning)
    while True:
        security()
        pi_state = db.get_data(userid, 'pi_state')
        if pi_state == "1":
            phone()
        else:
            db.up_system(userid, 'automate_state', '0')
            relay.off()  # 关闭电磁阀
            db.up_system(userid, 'motor_state', '0')
            print('Stopping......')
            time.sleep(10)
        time.sleep(2)
