AdminCommand
    =   WS c:AdminCommand WS? { return c; }
    /   ADMIN WS SERVER WS SETTINGS { return { 'adminCommand': 'server settings' }; }
    ;

ADMIN
    =   'admin'i
    ;
SERVER
    =   'server'i
    ;
SETTINGS
    =   'settings'i
    ;
WS  =   [ \t\r\n]+
    ;
