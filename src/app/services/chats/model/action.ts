export enum Action {
    JOINED = 'userJoinedPrivateChat',
    LEFT = 'userLeftPrivateChat',
    NEW_LOG_IN = 'newUserLoggedIn',
    SMN_LOGGED_OUT = 'someUserLoggedOut',
    SEND_PRIVATE_MSG = 'sendPrivateMessage',
    SEND_MSG = 'sendMessage',
    REQUEST_PM_SOCKET_ID = 'requestSocketIdForPM',
    //notifications
    REQUEST_NOTIFICATIONS = 'notifications',
    REQUEST_NOTIFICATION_COUNT = 'notificationCount'
}
