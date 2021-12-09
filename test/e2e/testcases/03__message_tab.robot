*** Settings ***
Documentation    Tests to verify message tab functionality for a user with member role
Library    SeleniumLibrary    implicit_wait=10s
Library    Screenshot
Library    ./resources/HelpFunc.py
Resource    ./resources/common.robot
Resource    ./resources/message_tab_res.robot
Resource    ./resources/elements.robot

Suite Setup    common.Open Slack In Browser And Login As User
Suite Teardown    common.Close Test Browser

*** Test Cases ***
Can Open Home Tab
    Maximize Browser Window
    Go To Home Tab

Request List For Saturday By Slash Command
    Go To Message Tab
    Send List Command    la
    ${date}=    Get Date For Message Tab    la
    Element Should Contain    ${latest_message}    Kukaan ei ole toimistolla ${date}

Request List For Sunday By Slash Command
    Go To Message Tab
    Send List Command    su
    ${date}=    Get Date For Message Tab    su
    Element Should Contain    ${latest_message}    Kukaan ei ole toimistolla ${date}

Add And Remove Office Signup By Slash Command
    Go To Message Tab
    ${DATE}=    Get Next Workday Short
    Send Signup Command    ${DATE}    toimisto
    ${DATE_LONG}=    Get Next Working Day Long
    Element Should Contain    ${latest_message}    Ilmoittautuminen lisätty - ${DATE_LONG} toimistolla.
    Send List Command    ${DATE}
    Element Should Contain    ${latest_message}    ${DATE} toimistolla
    Element Should Contain    ${latest_message}    @Jäsen Testikäyttäjä
    Send Remove Signup Command    ${DATE}
    Element Should Contain    ${latest_message}    Ilmoittautuminen poistettu
    Element Should Contain    ${latest_message}    ${DATE}
    Send List Command    ${DATE}
    Element Should Not Contain    ${latest_message}    @Jäsen Testikäyttäjä

Add Remote Signup By Slash Command
    Go To Message Tab
    ${DATE}=    Get Next Workday Short
    Send Signup Command    ${DATE}    etä
    ${DATE_LONG}=    Get Next Working Day Long
    Element Should Contain    ${latest_message}    Ilmoittautuminen lisätty - ${DATE_LONG} etänä.
    Send List Command    ${DATE}
    Element Should Not Contain    ${latest_message}    @Jäsen Testikäyttäjä

Add And Remove Default Office Signup By Slash Command
    Go To Message Tab
    Send Default Signup Command    ma    toimisto
    Element Should Contain    ${latest_message}    Oletusilmoittautuminen lisätty - maanantaisin toimistolla.
    ${NEXT_MONDAY}=    Get Next Monday
    Send List Command    ${NEXT_MONDAY}
    Element Should Contain    ${latest_message}    ${NEXT_MONDAY} toimistolla on:
    Element Should Contain    ${latest_message}    @Jäsen Testikäyttäjä
    Send Remove Default Signup Command    ma
    Element Should Contain    ${latest_message}    Oletusilmoittautuminen poistettu maanantailta
    Send List Command    ${NEXT_MONDAY}
    Element Should Not Contain    ${latest_message}    @Jäsen Testikäyttäjä

Add Default Remote Signup By Slash Command
    Go To Message Tab
    Send Default Signup Command    ma    etä
    Element Should Contain    ${latest_message}    Oletusilmoittautuminen lisätty - maanantaisin etänä.
    ${NEXT_MONDAY}=    Get Next Monday
    Send List Command    ${NEXT_MONDAY}
    Element Should Not Contain    ${latest_message}    @Jäsen Testikäyttäjä

List Team Member Signups
    Go To Message Tab
    ${DATE}=    Get Next Workday Short
    Send Signup Command    ${DATE}    toimisto
    ${DATE_LONG}=    Get Next Working Day Long
    Element Should Contain    ${latest_message}    Ilmoittautuminen lisätty - ${DATE_LONG} toimistolla.
    Send List Command With Team    ${DATE}    @testgroup 
    Element Should Contain    ${latest_message}    ${DATE} tiimistä @testgroup on toimistolla:
    Element Should Contain    ${latest_message}    @Jäsen Testikäyttäjä
    Send Remove Signup Command    ${DATE}
    Send List Command With Team    ${DATE}    @testgroup
    Element Should Not Contain    ${latest_message}    @Jäsen Testikäyttäjä