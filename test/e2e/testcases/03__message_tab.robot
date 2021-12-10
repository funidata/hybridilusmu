*** Settings ***
Documentation    Tests to verify message tab functionality for a user with member role
Library    SeleniumLibrary    implicit_wait=10s
Library    Screenshot
Library    ./resources/HelpFunc.py
Resource    ./resources/common.robot

Suite Setup    common.Open Slack In Browser And Login As User
Suite Teardown    common.Close Test Browser

*** Test Cases ***
Can Open Home Tab
    Maximize Browser Window
    Sleep   2s
    Go To Home Tab

List Saturday Command Gives Correct Respond
    Go To Message Tab
    Send List Command With Weekend Date Shortcut    la  

List Sunday Command Gives Correct Respond
    Send List Command With Weekend Date Shortcut    su
