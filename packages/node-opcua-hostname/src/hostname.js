"use strict";
const os = require("os");
const dns = require("dns");

const trim = function (str, length) {
    if (!length) {
        return str;
    }
    return str.substr(0, Math.min(str.length, length));
};

let _fully_qualified_domain_name_cache = null;

function get_fully_qualified_domain_name(optional_max_length) {
    if (_fully_qualified_domain_name_cache) {
        return trim(_fully_qualified_domain_name_cache, optional_max_length);
    }
    let fqdn;
    if (process.platform === "win32") {

        // http://serverfault.com/a/73643/251863
        const env = process.env;
        fqdn = env.COMPUTERNAME + ( (env.USERDNSDOMAIN && env.USERDNSDOMAIN.length > 0) ? "." + env.USERDNSDOMAIN : "");
        _fully_qualified_domain_name_cache = fqdn;

    } else {

        const hostname = os.hostname();
        dns.lookup(hostname, (err, ip) => {
            if (err) {
                _fully_qualified_domain_name_cache = os.hostname();
            } else {
                dns.lookupService(ip, 0, (err, hostname) => {
                    if (err) {
                        _fully_qualified_domain_name_cache = os.hostname();
                    } else {
                        _fully_qualified_domain_name_cache = hostname;
                    }
                });
            }
        });
    }
    return trim(_fully_qualified_domain_name_cache, optional_max_length);
}
// note : under windows ... echo %COMPUTERNAME%.%USERDNSDOMAIN%
exports.get_fully_qualified_domain_name = get_fully_qualified_domain_name;
