*** Settings ***
Library    Selenium2Library
Library    Screenshot
Library    ../resources/HelpFunc.py
Resource    ../resources/common.robot

Suite Setup    common.Open Slack In Browser And Login As User
Suite Teardown    common.Close Test Browser

*** Variables ***

*** Test Cases ***
Can Open Home Tab
    Sleep    1s
    Maximize Browser Window
    Scroll Element Into View    //span[@data-qa='channel_sidebar_name_lindan-hybridilusmu']
    Wait Until Element Is Visible    //span[@data-qa='channel_sidebar_name_lindan-hybridilusmu']
    Click Element    //span[@data-qa='channel_sidebar_name_lindan-hybridilusmu']
    Element Should Contain    //div[@data-qa='channel_name']    Lindan-hybridilusmu

Correct Dates
    ${date}    Get Date For Home Tab Signups
    Wait Until Element Is Visible    //div[@data-qa='block-kit-renderer']//div[contains(h3, $date)]