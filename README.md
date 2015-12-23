HubTaxi: ClientSide
===

The clientside have 3 part:
- Manager: To manage all driver and user. (Fix URL API: manager/scripts/utils/vsoft.js line:26)
- Driver: For drivers used. (Fix URL API: driver/scripts/services/configuration.js line: 9) (user/pass: 30h-9999/123123)
- Client: Hybrid app for users. (Fix URL API: client/scripts/utils/vsoft.js line:28)

We used bower to manager all dependencies. You must run: `bower install` to install all dependencies for this app.
To run app, locate each part to server static (such as apache, nginx root directory) and see it on localhost.

In addition, I provide a apk file named HubTaxi.apk to install android machine. I also provide an application for OSX. You can search keywork "HubTaxi" on apple store, instal and feel. :-)

Read full info at [here!](https://github.com/vsoft-lab/HubTaxi-Server)

