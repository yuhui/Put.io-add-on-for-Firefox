PutIO.UI = {

  _instantApply : Application.prefs.get("browser.preferences.instantApply"),

	/* Functions to deal with property files */
	_getStringBundle : function() {
		return document.getElementById("putioStringBundle");
	},
	_getString : function(key) {
		let strbundle = this._getStringBundle();
		try {
  		return strbundle.getString(key);
		} catch (e) {
  		return key;
		}
	},
	_getFormattedString : function(key, argv) {
	  if (argv == null || argv.length == 0) {
	    return this._getString(key);
	  } else {
  		let strbundle = this._getStringBundle();
  		try {
  		  return strbundle.getFormattedString(key,argv);
  	  } catch (e) {
  	    return key;
  	  }
	  }
	},
	/* END Functions to deal with property files */

	/* Functions for dialogs */
  _openDialog : function(url, name, options, isModal) {
    if (options.length > 0) {
      options += ",";
    }
    if (null == this._dialog || this._dialog.closed) {
  		this._dialog = window.openDialog(
  		  url,
  		  name,
  		  "centerscreen,chrome,resizable," + options + (isModal ? (this._instantApply.value ? "dialog=no" : "modal") : "")
  		);
		}
    this._dialog.focus();
  },
	/* END Functions for dialogs */

	/* Functions for windows and tabs */
  // https://developer.mozilla.org/en/Code_snippets/Tabbed_browser#Reusing_tabs
  _openAndReuseOneTab : function(url) {
    let wm                = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    let browserEnumerator = wm.getEnumerator("navigator:browser");
    let found, index, browserWin, tabbrowser, currentTab;

    for (found = false, index = 0, tabbrowser = browserEnumerator.getNext().gBrowser;
         index < tabbrowser.tabContainer.childNodes.length && !found;
         index++) {

      // Get the next tab
      currentTab = tabbrowser.tabContainer.childNodes[index];

      // Does this tab contain our custom attribute?
      if (currentTab.hasAttribute("putioWindow")) {
        // Yes--select it.
        tabbrowser.selectedTab = currentTab;
        found = true;
        break;
      }

    }

    if (!found) {
      // Our tab isn't open. Open it now.
      browserEnumerator = wm.getEnumerator("navigator:browser");
      tabbrowser = browserEnumerator.getNext().gBrowser;

      // Create and select tab
      let newTab = tabbrowser.addTab(url);
      newTab.setAttribute("putioWindow", "putio");
      tabbrowser.selectedTab = newTab;
    }

    tabbrowser.ownerDocument.defaultView.focus();
    tabbrowser.loadURI(url);
  },
	/* END Functions for windows and tabs */

  init : function() {
    let that = this;

    this._instantApply = Application.prefs.get("browser.preferences.instantApply");

    // Save Link from the contextual menu item
		document.getElementById("putioContextMenupopupSaveLink").addEventListener("command", function () {
		  PutIO.BrowserOverlay.saveLink();
		}, true);
		window.addEventListener("contextmenu", function (aEvent) {
		  let menu          = document.getElementById("putioContextMenupopupSaveLink");
		  let menuseparator = document.getElementById("putioContextMenupopupSaveLinkSeparator");
		  if (aEvent.target.nodeName.toUpperCase() === "A") {
		    menu.hidden          = false;
		    menuseparator.hidden = false;
		  } else {
		    menu.hidden          = true;
		    menuseparator.hidden = true;
		  }
		}, false);
    // open "Your Files" web page from the contextual menu item
		document.getElementById("putioContextMenupopupYourFiles").addEventListener("command", function () {
		  that.openYourFiles();
		}, true);
    // open "Active Transfers" web page from the contextual menu item
		document.getElementById("putioContextMenupopupActiveTransfers").addEventListener("command", function () {
		  that.openActiveTransfers();
		}, true);
    // open Help webpage from the contextual menu item
		document.getElementById("putioContextMenupopupHelp").addEventListener("command", function () {
		  that.openHelp();
		}, true);
    // open About dialog from the contextual menu item
		document.getElementById("putioContextMenupopupAbout").addEventListener("command", function () {
		  that.openAbout();
		}, true);

    // open Preferences dialog from the Tools menu item
		document.getElementById("putioToolsMenupopupPreferences").addEventListener("command", function () {
		  that.openPreferences();
		}, true);
    // open "Your Files" web page from the Tools menu item
		document.getElementById("putioToolsMenupopupYourFiles").addEventListener("command", function () {
		  that.openYourFiles();
		}, true);
    // open "Active Transfers" web page from the Tools menu item
		document.getElementById("putioToolsMenupopupActiveTransfers").addEventListener("command", function () {
		  that.openActiveTransfers();
		}, true);
    // open Help webpage from the contextual menu item
		document.getElementById("putioToolsMenupopupHelp").addEventListener("command", function () {
		  that.openHelp();
		}, true);
    // open About dialog from the Tools menu item
		document.getElementById("putioToolsMenupopupAbout").addEventListener("command", function () {
		  that.openAbout();
		}, true);
  },

	openAbout : function() {
    this._openDialog(
      "chrome://putio/content/about/about.xul",
      "putioAboutWindow",
      "",
      false
    );
	},

  openPreferences : function() {
    this._openDialog(
      "chrome://putio/content/preferences/preferences.xul",
      "putioPreferencesDialog",
      "titlebar,toolbar",
      true
    );
  },

  openActiveTransfers : function() {
	  this._openAndReuseOneTab("https://put.io/transfers");
  },

  openYourFiles : function() {
	  this._openAndReuseOneTab("https://put.io/your-files");
  },

  openHelp : function() {
	  this._openAndReuseOneTab("https://github.com/yuhui/Put.io-add-on-for-Firefox/wiki/Help");
  },

  addNotification : function(notificationWindow, labelWithArgv, value, priority, buttons) {
    let that                    = this;

    let notificationBox         = getNotificationBox(notificationWindow);
    let notificationLabel       = this._getFormattedString(labelWithArgv[0], labelWithArgv[1]);
    let notificationValue       = value;

    let notificationButtons     = new Array();
    if (buttons.length > 0) {
      let button;
      for (let i = 0; i < buttons.length; i++) {
        switch (buttons[i]) {
          case "active transfers":
            button = {
              label     : this._getString("putio.saveLink.notification.activeTransfersButton.label"),
              accessKey : this._getString("putio.saveLink.notification.activeTransfersButton.accessKey"),
              popup     : null,
              callback  : function() {
                that.openActiveTransfers();
                notificationBox.removeNotification(notificationBox.getNotificationWithValue(notificationValue));
              }
            }
            break;
          case "preferences":
            button = {
              label     : this._getString("putio.preferences.notification.openPreferencesButton.label"),
              accessKey : this._getString("putio.preferences.notification.openPreferencesButton.accessKey"),
              popup     : null,
              callback  : function() {
                that.openPreferences();
              }
            }
            break;
        }
        notificationButtons[i] = button;
      }
    }

    notificationBox.appendNotification(
      notificationLabel,
      notificationValue,
      "chrome://putio/skin/images/icon_16x16.png",
      notificationBox[priority],
      notificationButtons
    );
  },

  removeNotification : function(notificationWindow, value) {
    let notificationBox  = getNotificationBox(notificationWindow);
    let thisNotification = notificationBox.getNotificationWithValue(value);
    if (thisNotification) {
      thisNotification = notificationBox.removeNotification(thisNotification);
    }
  },

  replaceNotification : function(notificationWindow, labelWithArgv, value, priority, buttons) {
    this.removeNotification(notificationWindow, value);
    this.addNotification(notificationWindow, labelWithArgv, value, priority, buttons);
  }

};
