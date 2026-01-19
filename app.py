from flask import Flask, render_template

from application.database import db
from application.models import User

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///LearningApp.db'
app.config['SECRET_KEY'] = 'SuperSecretKey123/@'
db.init_app(app)
app.app_context().push()

from application.controllers import *

if __name__ == '__main__':
    # db.create_all()
    # user1 = User(username="admin123",email="admin@user.com",password="1234",role="admin")
    # db.session.add(user1)
    # db.session.commit()
    app.run(debug=True)
