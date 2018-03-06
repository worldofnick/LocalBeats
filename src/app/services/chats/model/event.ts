export enum SocketEvent {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    NEW_LOG_IN = 'newUserLoggedIn',
    SMN_LOGGED_OUT = 'someUserLoggedOut',
    SEND_PRIVATE_MSG = 'sendPrivateMessage',
    SEND_MSG = 'sendMessage',
    PERSISTED_LOGIN = 'persistedLogin',
    REQUEST_PM_SOCKET_ID = 'requestSocketIdForPM',
    GREET_WITH_BEATBOT = 'addBeatBotToUserMessage',
    REQUEST_MSG_FROM_PROFILE_BUTTON = 'requestNewMsgFromProfileButtonClick',
    NOTIFY_SERVER_CHAT_LOADED = 'chatComponentDoneLoading',
    OPEN_SNACK_BAR_PM = 'openPmSnackBarThread',
    //notifications
    REQUEST_NOTIFICATIONS = 'notifications',
    REQUEST_NOTIFICATION_COUNT = 'notificationCount',
    SEND_NOTIFICATION = 'sendNotification',
    UPDATE_PROFILE = 'updateProfile',
    NEW_REVIEW = 'newReview'
}
