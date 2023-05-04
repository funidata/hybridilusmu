*** Settings ***
Documentation    Keywords for testing the home tab of app home
Library    SeleniumLibrary    implicit_wait=10s
Library    HelpFunc.py
Resource    variables.robot
Resource    common.robot
Resource    elements.robot

*** Keywords ***
Regular Office Signup
    [Arguments]    ${date}
    ${next_workday_buttons}=    Get Next Workday Buttons Element    ${date}
    Wait Until Element Is Visible    ${next_workday_buttons}//button[@data-qa-action-id='office_click']
    Click Element    ${next_workday_buttons}//button[@data-qa-action-id='office_click']

Regular Remote Signup
    [Arguments]    ${date}
    ${next_workday_buttons}=    Get Next Workday Buttons Element    ${date}
    Wait Until Element Is Visible    ${next_workday_buttons}//button[@data-qa-action-id='remote_click']
    Click Element    ${next_workday_buttons}//button[@data-qa-action-id='remote_click']

Update Home Tab View
    Wait Until Element Is Visible    ${update_button}
    Click Element    ${update_button}
    ${date}=    Get Current Date For Home Tab Update
    Wait For Bot action
    Wait Until Element Is Visible    ${update_text}
    Element Should Contain    ${update_text}    ${date}