const http = require("http");
const urls = {
  openweathermap : {
    identity: '&APPID=',
    units: '&units=',
    base: 'http://api.openweathermap.org/data/2.5/weather?'
  }
}

const defaultoptions = {
  source: 'openweathermap',
  key: null,
  units: 'metric',
  cacheInterval: 600000,
  safeInterval: 600000
}


class Weather {

  constructor(options) {
    options = options || defaultoptions;
    this._key = options.key;
    this._options = Object.assign(defaultoptions, options);
    this._cache = {};
    this._lastTime = 0;
  }

  setkey(key) {
    if (typeof key != null) {
      this._key = key;
    }
  }

  setUnits(name) {
    if (typeof name === 'string') {
      this._options.units = name || 'metric';
    }
  }

  now(x, cl) {
    let time = (new Date()).getTime();
    if (time - this._lastTime <= this._options.safeInterval) {
      return;
    }
    if (typeof this._cache[x] != 'undefined') {
      if (typeof x === 'string') {
        x = x.toLowerCase();
      }
      if ((time - this._cache[x]._time) <= this._options.cacheInterval) {
        if (typeof cl === 'function') {
          cl(this._cache[x]);
        }
        return;
      }
    }
    if (this._options.source === 'openweathermap') {
      let u = urls.openweathermap;
      let url = u.base;
      if (typeof x === 'string') {
        url += `q=${x}`;
      } else if (typeof x === 'number') {
        url += `id=${x}`;
      } else {
        return;
      }
      url += (u.units + this._options.units + u.identity + this._key);
      this._request(url, cl);
    }
  }

  _request(url, cl) {
    http.get(url, (res) => {
      //let obj = JSON.parse(res);
      const {
        statusCode
      } = res;
      const contentType = res.headers['content-type'];

      if (statusCode != 200) {
        console.log('error');
        return;
      }
      res.setEncoding('utf8');
      let raw = '';
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        const info = JSON.parse(raw);
        if (typeof cl === 'function') {
          cl(info);
        }
        let time = (new Date()).getTime();
        info._time = time;
        this._cache[info.name.toLowerCase()] = info;
        this._cache[info.id] = info;
      });

    });
  }
}






module.exports = Weather;
