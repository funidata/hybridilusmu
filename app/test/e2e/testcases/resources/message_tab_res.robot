*** Settings ***
Documentation    Keywords for testing the message tab of app home
Library    SeleniumLibrary    implicit_wait=10s
Library    HelpFunc.py
Resource    variables.robot
Resource    elements.robot
Resource    common.robot

*** Keywords ***
Send Signup Command
    [Arguments]    ${date}    ${status}
    Input Text    ${message_input}    /${COMMAND_PREFIX}ilmoita ${date} ${status}
    Click Element    ${send_message_button}
    Wait For Bot action
    ${PRESENT}=    Run Keyword And Return Status    Element Should Be Visible   ${new_messages_button}
    Run Keyword If    ${PRESENT}    Click Element    ${new_messages_button}
    Sleep    1s
    Scroll Element Into View    ${latest_message}

Send List Command
    [Arguments]    ${date}
    Input Text    ${message_input}    /${COMMAND_PREFIX}listaa ${date}
    Click Element    ${send_message_button}
    Wait For Bot action
    ${PRESENT}=    Run Keyword And Return Status    Element Should Be Visible   ${new_messages_button}
    Run Keyword If    ${PRESENT}    Click Element    ${new_messages_button}
    Sleep    1s
    Scroll Element Into View    ${latest_message}

Send List Command With Team
    [Arguments]    ${date}    ${team}
    Input Text    ${message_input}    /${COMMAND_PREFIX}listaa ${date}
    Press Keys    ${message_input}    SPACE
    Press Keys    ${message_input}    @testgrou
    Click Element    //div[@class='c-base_list_entity__primary_content']
    Click Element    ${send_message_button}
    Wait For Bot action
    ${PRESENT}=    Run Keyword And Return Status    Element Should Be Visible   ${new_messages_button}
    Run Keyword If    ${PRESENT}    Click Element    ${new_messages_button}
    Sleep    1s
    Scroll Element Into View    ${latest_message}

Send Remove Signup Command
    [Arguments]    ${date}
    Input Text    ${message_input}    /${COMMAND_PREFIX}poista ${date}
    Click Element    ${send_message_button}
    Wait For Bot action
    ${PRESENT}=    Run Keyword And Return Status    Element Should Be Visible   ${new_messages_button}
    Run Keyword If    ${PRESENT}    Click Element    ${new_messages_button}
    Sleep    1s
    Scroll Element Into View    ${latest_message}

Send Default Signup Command
    [Arguments]    ${date}    ${status}
    Input Text    ${message_input}    /${COMMAND_PREFIX}ilmoita def ${date} ${status}
    Click Element    ${send_message_button}
    Wait For Bot action
    ${PRESENT}=    Run Keyword And Return Status    Element Should Be Visible   ${new_messages_button}
    Run Keyword If    ${PRESENT}    Click Element    ${new_messages_button}
    Sleep    1s
    Scroll Element Into View    ${latest_message}

Send Remove Default Signup Command
    [Arguments]    ${date}
    Input Text    ${message_input}    /${COMMAND_PREFIX}poista def ${date}
    Click Element    ${send_message_button}
    Wait For Bot action
    ${PRESENT}=    Run Keyword And Return Status    Element Should Be Visible   ${new_messages_button}
    Run Keyword If    ${PRESENT}    Click Element    ${new_messages_button}
    Sleep    1s
    Scroll Element Into View    ${latest_message}