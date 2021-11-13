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

Use Slash Command In Guest Channel
    Input Text    //div[@data-qa='message_input']/div    /lindalistaa tänään
    Click Element    //button[@data-qa='texty_send_button']
    Sleep    1s
    Scroll Element Into View    (//div[@class='c-virtual_list__scroll_container'])[2]/div[@class='c-virtual_list__item'][last()]
    Element Should Contain    (//div[@class='c-virtual_list__scroll_container'])[2]/div[@class='c-virtual_list__item'][last()]    This command can't be used by guests in this workspace.  

Cannot See App Content
    Wait Until Element Is Visible    //span[@data-qa='channel_sidebar_name_lindan-hybridilusmu']
    Click Element    //span[@data-qa='channel_sidebar_name_lindan-hybridilusmu']
    Wait Until Element Is Visible    //div[@data-qa='app_home_bk_app_view']
    Element Should Contain    //div[@data-qa='app_home_bk_app_view']/*    Pahoittelut, @Vieras Testikäyttäjä. Olet vieraskäyttäjä tässä Slack-työtilassa, joten et voi käyttää tätä bottia.
    Element Should Not Contain    //div[@data-qa='app_home_bk_app_view']/*    Tiedot päivitetty
    Page Should Not Contain Element    //div[@data-qa='app_home_bk_app_view']//button

Error Message In Message Tab
    Wait Until Element Is Visible    //button[@data-qa='messages']
    Click Element    //button[@data-qa='messages']
    Wait Until Element Is Visible    //div[@data-qa='message_input']/div
    Sleep    1s
    Element Should Contain    (//div[@class='c-virtual_list__scroll_container'])[2]/div[@class='c-virtual_list__item'][last()]    Pahoittelut, @Vieras Testikäyttäjä. Olet vieraskäyttäjä tässä Slack-työtilassa, joten et voi käyttää tätä bottia.
    Input Text    //div[@data-qa='message_input']/div    /lindalistaa tänään
    Click Element    //button[@data-qa='texty_send_button']
    Sleep    1s
    Scroll Element Into View    (//div[@class='c-virtual_list__scroll_container'])[2]/div[@class='c-virtual_list__item'][last()]
    Element Should Contain    (//div[@class='c-virtual_list__scroll_container'])[2]/div[@class='c-virtual_list__item'][last()]    This command can't be used by guests in this workspace.  