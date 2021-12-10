*** Variables ****
${login_email}    //input[@data-qa='login_email']
${login_password}    //input[@data-qa='login_password']
${login_button}    //button[@data-qa='signin_button']

${channel_name}    //div[@data-qa='channel_name']
${latest_message}    (//div[@class='c-virtual_list__scroll_container'])[2]/div[@class='c-virtual_list__item'][last()]
${message_input}    //div[@data-qa='message_input']/div
${send_message_button}    //button[@data-qa='texty_send_button']
${new_messages_button}    //button[@class='c-button-unstyled p-message_pane__unread_banner__msg']
${messages_tab}    //button[@data-qa='messages']
${app_home}    //span[@data-qa='channel_sidebar_name_test-hybridilusmu']