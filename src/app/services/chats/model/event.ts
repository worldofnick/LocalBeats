export enum SocketEvent {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    NEW_LOG_IN = 'newUserLoggedIn',
    SMN_LOGGED_OUT = 'someUserLoggedOut',
    YOU_LOGGED_OUT = 'youLoggedOut',
    SEND_PRIVATE_MSG = 'sendPrivateMessage',
    SEND_MSG = 'sendMessage',
    MAGIC_LOGIN_RESULT = 'magicLoginResult',
    PERSISTED_LOGIN = 'persistedLogin',
    REQUEST_PM_SOCKET_ID = 'requestSocketIdForPM',
    GREET_WITH_BEATBOT = 'addBeatBotToUserMessage',
    REQUEST_MSG_FROM_PROFILE_BUTTON = 'requestNewMsgFromProfileButtonClick',
    NOTIFY_SERVER_CHAT_LOADED = 'chatComponentDoneLoading',
    OPEN_SNACK_BAR_PM = 'openPmSnackBarThread',

    // Notifications
    REQUEST_NOTIFICATIONS = 'notifications',
    TELL_TOP_BAR = 'tellTopBar',
    TELL_NOTIFICATION_PANEL = 'tellNotificationPanel',
    REQUEST_NOTIFICATION_COUNT = 'notificationCount',
    SEND_NOTIFICATION = 'sendNotification',
    NOTIFY_OTHER_HOSTS_BID_ACCEPTED = 'bidOtherHostsBidAccepted',
    UPDATE_PROFILE = 'updateProfile',
    NEW_REVIEW = 'newReview'
}
