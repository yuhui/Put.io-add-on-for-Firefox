PutIO.BrowserOverlay = {

  init : function(aEvent) {
    PutIO.UI.init();
    PutIO.Preferences.init();
  },

  saveLink : function() {
    let saveLinkNotificationValue = "putioSaveLinkNotification" + Math.random();
    let notificationWindow = gBrowser.contentWindow;

    // check that the API Key and Secret are not empty
    if (PutIO.Preferences.apiKey    === null || PutIO.Preferences.apiKey    === "" ||
        PutIO.Preferences.apiSecret === null || PutIO.Preferences.apiSecret === "") {

      PutIO.UI.replaceNotification(
        notificationWindow,
        ["putio.preferences.notification.label"],
        saveLinkNotificationValue,
        "PRIORITY_INFO_LOW",
        ["preferences"]
      );

    } else {

      PutIO.UI.addNotification(
        notificationWindow,
        ["putio.saveLink.notification.label"],
        saveLinkNotificationValue,
        "PRIORITY_INFO_LOW",
        []
      );

      let putioRequest = {
        api_key    : PutIO.Preferences.apiKey,
        api_secret : PutIO.Preferences.apiSecret,
        params     : {
          links : [gContextMenu.linkURL]
        }
      };
      let url = "http://api.put.io/v1/transfers?method=add&amp;request=" + encodeURIComponent(JSON.stringify(putioRequest));
      let request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
      request.onload = function(aEvent) {
        let putioResponse = JSON.parse(aEvent.target.responseText);
        if (putioResponse.error === null || !putioResponse.error) {
          // Put.io add transfer success!
          PutIO.UI.replaceNotification(
            notificationWindow,
            ["putio.saveLink.notification.load_success"],
            saveLinkNotificationValue,
            "PRIORITY_INFO_MEDIUM",
            ["active transfers"]
          );
          // remove notification after 1 minute
          let timeoutID = setTimeout(
            PutIO.UI.removeNotification,
            0.5*60*1000,
            notificationWindow,
            saveLinkNotificationValue
          );
        } else {
          // Put.io error occurred
          PutIO.UI.replaceNotification(
            notificationWindow,
            ["putio.saveLink.notification.load_error", [putioResponse.error_message]],
            saveLinkNotificationValue,
            "PRIORITY_WARNING_HIGH",
            []
          );
        }
      };
      request.onerror = function(aEvent) {
        PutIO.UI.replaceNotification(
          notificationWindow,
          ["putio.saveLink.notification.http_error", [aEvent.target.status, aEvent.target.statusText]],
          saveLinkNotificationValue,
          "PRIORITY_WARNING_LOW",
          []
        );
      };
      request.open("GET", url, true);
      request.send(null);
    }

  }

};

window.addEventListener("load", function () {
  PutIO.BrowserOverlay.init();
}, false);
