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

Cannot See App Content
    Wait Until Element Is Visible    //span[@data-qa='channel_sidebar_name_lindan-hybridilusmu']
    Click Element    //span[@data-qa='channel_sidebar_name_lindan-hybridilusmu']
    Wait Until Element Is Visible    //div[@data-qa='app_home_bk_app_view']
    Element Should Contain    //div[@data-qa='app_home_bk_app_view']/*    Pahoittelut, @Vieras Testikäyttäjä. Olet vieraskäyttäjä tässä Slack-työtilassa, joten et voi käyttää tätä bottia.
    Element Should Not Contain    //div[@data-qa='app_home_bk_app_view']/*    Tiedot päivitetty