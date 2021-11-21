*** Settings ***
Library    Selenium2Library
Library    Screenshot
Library    ../resources/HelpFunc.py
Resource    ../resources/common.robot

Suite Setup    common.Open Slack In Browser And Login As User
Suite Teardown    common.Close Test Browser

*** Test Cases ***
Can Open Home Tab
    Maximize Browser Window
    Sleep    5s
    Scroll Element Into View    //span[@data-qa='channel_sidebar_name_test-hybridilusmu']
    Wait Until Element Is Visible    //span[@data-qa='channel_sidebar_name_test-hybridilusmu']
    Click Element    //span[@data-qa='channel_sidebar_name_test-hybridilusmu']
    Element Should Contain    //div[@data-qa='channel_name']    test-hybridilusmu

Correct Dates
    Wait Until Element Is Visible    //button[@data-qa-action-id='update_click']
    FOR    ${INDEX}    IN RANGE    0    ${10}
        ${date}    Get Date For Home Tab Signups    ${INDEX}
        Scroll Element Into View    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${date}')]
        Wait Until Element Is Visible    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${date}')]
    END