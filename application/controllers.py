from flask import current_app as app
from flask import render_template



@app.route('/')
def home():
    return render_template('home.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/normal')
def normal():
    return render_template('normal.html')

@app.route('/handicap')
def handicap():
    return render_template('handicap_user.html')

@app.route('/translation')
def translation():
    return render_template('translation.html')