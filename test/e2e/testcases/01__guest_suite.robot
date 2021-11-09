*** Settings ***
Library    Selenium2Library
Library    Screenshot
Library    ../resources/HelpFunc.py
Resource    ../resources/common.robot

Suite Setup    common.Open Slack In Browser And Login As Guest
Suite Teardown    common.Close Test Browser

*** Test Cases ***

Can Go To Guest Channel
    Maximize Browser Window
    Wait Until Element Is Visible    //div[@data-qa='channel_name']
    Element Should Contain    //div[@data-qa='channel_name']    vieraskanava
