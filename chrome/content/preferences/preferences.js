PutIO.Preferences = {

  // global variables to hold the Put.io API Key and Secret preferences
  _prefApiKey    : null,
  _prefApiSecret : null,

  get apiKey() {
    return this._prefApiKey.value;
  },

  get apiSecret() {
    return this._prefApiSecret.value;
  },

  init : function() {
    this._prefApiKey    = Application.prefs.get("extensions.putio.apiKey"   );
    this._prefApiSecret = Application.prefs.get("extensions.putio.apiSecret");
  }

};
