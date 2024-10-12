from flask import Flask, request, Response 
from slack_sdk import WebClient
import json
from datetime import datetime
from slack_sdk.errors import SlackApiError
import sys, os
import requests

app = Flask(__name__)
to_run = True
# Set up Slack API client
slack_token = "xoxb-773919780944-7859863278310-g6BjJyZdol0B52IbHcVG7Que"
client = WebClient(token=slack_token)


@app.route('/book', methods=['POST'])
def receive_message():
    # Parse and validate data
    url = request.json['url']
    date_and_time = request.json['date']
    match = request.json['match']
    quantity = request.json['quantity']
    total_price = request.json['total']
    category = request.json['category']
    sector = request.json['sector']
    seats = request.json['seats']
    cookies = request.json['cookies']
    user_agent = request.json['user_agent']
    data = f'*Date:* {date_and_time}\n*Amount:* {quantity}\n*Total Price:* {total_price}\n*Match:* {match}\n*category:* {category}\n*Sector:* {sector}'
    for seat in seats:
        data += f'\n*Seat:* {seat}'
    data += f"\n*Url:* {url}"
    
    send_to_group_channel(data, cookies, user_agent)
    return ''


def send_to_group_channel(data, cookies, ua):
    cookie_file = client.files_upload_v2(
            title="Cookies",
            filename="cookies.txt",
            content=str(cookies),
        )
    cookie_url = cookie_file.get("file").get("permalink")
    user_file = client.files_upload_v2(
        title="User-Agent",
        filename="userAgent.txt",
        content=str(ua),
    )
    user_url = user_file.get("file").get("permalink")
    
    client.chat_postMessage(
        channel="#ticketmaster_notifications_temp",
        text=f"{data}\n*User-Agent:* {user_url}\n*Cookie:* {cookie_url}",
        parse="mrkdwn"
    )

if __name__ == '__main__':
    app.run(debug=True, port=80)
