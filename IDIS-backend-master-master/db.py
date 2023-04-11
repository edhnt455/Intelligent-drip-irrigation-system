import pymysql
import traceback
import time
import pandas as pd


class DB:
    def __init__(self):
        # 连接数据库
        self.conn = pymysql.connect(
            host='0.0.0.0',
            user='root',
            passwd='root',
            db='raspberry',  # 数据库名称
            port=31306,
            charset='utf8')  # db:表示数据库名称
        # 使用cursor()方法创建一个游标对象
        self.cur = self.conn.cursor()

    @staticmethod
    def add_log(content):  # 添加日志
        with open('log.txt', 'w+') as f:
            f.write(time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()))
            f.write(content)

    def new_user(self, username, userpass, city, iyuu):  # 新建注册用户
        sql_search_no = "select * from user order by id desc limit 0,1"  # 将数据库id这一列按降序排列，每次只取第一个数据
        try:
            self.cur.execute(sql_search_no)
            last_no = self.cur.fetchone()[0]  # 获取数据库中最后一个id号
            user_id = int(last_no) + 1
            sql = "INSERT INTO user(id, username, pass, iyuu, city) VALUES (%r, %s, %s, %s, %s)"  # 创建新用户
            user_list = [int(user_id), username, userpass, iyuu, city]
            self.cur.execute(sql, user_list)  # 执行数据库插入
            self.conn.commit()  # 提交
            return True
        except Exception:
            self.add_log(traceback.format_exc())
            traceback.print_exc()
            return False

    def judge_user(self, user, pas):  # 传入的参数是用户输入的姓名user和密码pas
        try:
            sql_user = "SELECT username FROM user"  # 从数据库中查找所有的username
            sql_pass = "SELECT id,pass FROM user WHERE username = %s"  # 查找user用户的密码
            self.cur.execute(sql_user)
            user_db = self.cur.fetchall()  # 获取数据库中username这一列的所有名字
            for i in user_db:  # 为user_db去掉一层括号（因为返回的对象是元组）
                if user == i[0]:  # 再去掉一层括号，得到数据库中的username字符串和输入的user比对
                    self.cur.execute(sql_pass, user)
                    ans = self.cur.fetchone()
                    pass_db = ans[1]  # 此时,通过 pass_db[0],pass_db[1]可以依次访问id,pass
                    if pas == pass_db:  # pass_db即是sql_pass
                        return ans[0]  # 有该用户且密码正确,返回用户id
                    else:
                        return -200  # 有该用户，密码错误
            return -300  # 无该用户
        except Exception:
            self.add_log(traceback.format_exc())
            traceback.print_exc()
            return False

    def insert_pic(self, id, pic, pic_type):  # 插入图片
        sql = "INSERT INTO picture(id, pic, date, type) VALUES (%s, %s, %s, %s)"
        try:
            nowtime = time.strftime("%Y-%m-%d %H:%M", time.localtime())
            pic_list = [id, pic, nowtime, pic_type]
            self.cur.execute(sql, pic_list)  # 执行数据库插入
            self.conn.commit()  # 提交
            return True
        except Exception:
            self.add_log(traceback.format_exc())
            traceback.print_exc()
            return False

    def get_pic(self, id, type):  # 获取图片
        sql = "SELECT pic FROM picture WHERE id = %s AND type = %s ORDER BY date desc limit 0,1" % (id, type)
        try:
            self.cur.execute(sql)
            ans = self.cur.fetchone()[0]
            return ans
        except Exception:
            self.add_log(traceback.format_exc())
            traceback.print_exc()
            return False

    def insert_date(self, id, humidity, temperature, light, moisture):
        sql = "INSERT INTO plant(id, times, humidity, temperature, light, moisture) VALUES (%s, %s, %s, %s, %s, %s)"
        try:
            nowtime = time.strftime("%Y-%m-%d %H:%M", time.localtime())
            plant_list = [id, nowtime, humidity, temperature, light, moisture]
            self.cur.execute(sql, plant_list)  # 执行数据库插入
            self.conn.commit()  # 提交
            return True
        except Exception:
            self.add_log(traceback.format_exc())
            traceback.print_exc()
            return False

    def get_data(self, id, tag):
        sql = "select %s from system where id = %s" % (tag, id)
        try:
            self.cur.execute(sql)
            ans = self.cur.fetchone()
            return ans[0]
        except Exception:
            self.add_log(traceback.format_exc())
            traceback.print_exc()
            return False

    def up_system(self, id, tag, value):
        sql = "update system set %s = %s WHERE id = %s" % (tag, value, id)
        try:
            self.cur.execute(sql)
            self.conn.commit()
            return True
        except Exception:
            self.add_log(traceback.format_exc())
            traceback.print_exc()
            return False

    def get_now_data(self,id):
        sql = "select humidity,temperature,light,moisture from plant where id = %s order by times desc limit 0,1" % id
        motor = self.get_data(id, 'motor_state')
        auto = self.get_data(id, 'automate_state')
        try:
            self.cur.execute(sql)
            ans = list(self.cur.fetchone())
            ans.append(motor)
            ans.append(auto)
            return ans
        except Exception:
            self.add_log(traceback.format_exc())
            traceback.print_exc()
            return False

    def get_chart(self, id):
        sql = "select times,humidity,temperature,light,moisture from plant where id = %s order by times desc limit 0,6" % id
        try:
            result = pd.read_sql(sql, self.conn)
            df1 = result.sort_values(by="times")
            humidity = (df1['humidity'].values).tolist()
            temperature = (df1['temperature'].values).tolist()
            light = (df1['light'].values).tolist()
            moisture = (df1['moisture'].values).tolist()
            res = {'categories': ['00','04','08','12','16','20'],
                   'series':[
                       {
                           'name' : "湿度",
                           'data' : humidity
                       },
                       {
                           'name': "温度",
                           'data': temperature
                       },
                       {
                           'name': "光照",
                           'data': light
                       },
                       {
                           'name': "土壤湿度",
                           'data': moisture
                       },
                   ]
                   }
            res2={'ans':res}
            return res2
        except Exception:
            self.add_log(traceback.format_exc())
            traceback.print_exc()
            return False

    def insert_plantsdb(self, id, water):
        nowtime = time.strftime("%Y-%m-%d %H:%M", time.localtime())
        sql = "INSERT INTO plantsdb(id, times, water) VALUES (%s, %s, %s)"
        try:
            plant_list = [id, nowtime, water]
            self.cur.execute(sql, plant_list)  # 执行数据库插入
            self.conn.commit()  # 提交
            return True
        except Exception:
            self.add_log(traceback.format_exc())
            traceback.print_exc()
            return False


# db = DB()
# db.insert_date(1,35.6,72.35,15,64)
