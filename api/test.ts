const fs = require('fs');
const pg = require('pg');
const url = require('url');

const config = {
    user: "avnadmin",
    password: "AVNS_4NMugWcbAOIjkUAmCn7",
    host: "sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com",
    port: 24897,
    database: "defaultdb",
    ssl: {
        rejectUnauthorized: true,
        ca: `-----BEGIN CERTIFICATE-----
MIIEUDCCArigAwIBAgIUKNDtTHYvSkJ85MawoQndJBrCEfMwDQYJKoZIhvcNAQEM
BQAwQDE+MDwGA1UEAww1MDkwYjFiYTQtZTg4Mi00MjBmLTk1NzMtZGJiZmMyZGI4
NmJmIEdFTiAxIFByb2plY3QgQ0EwHhcNMjUxMDEzMTQxOTA5WhcNMzUxMDExMTQx
OTA5WjBAMT4wPAYDVQQDDDUwOTBiMWJhNC1lODgyLTQyMGYtOTU3My1kYmJmYzJk
Yjg2YmYgR0VOIDEgUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC
AYoCggGBANC2ltoU9fZA/2mh/G8ByxDaJ73rfiQF2IAJ6h0eNy22T7H/pQK659tp
AtdE2gk6jlmkufvvtYTQtwUpTjyzN8F6AZ1ML1Heh4b/3IPDz9PtW2CVEWilzJt0
pe3YeJsZvAdYyj7CQkO9xnoZSI2REu9yhYdHO3DczRhAa8GlGwCZwXxcwakPxHL6
vSXiDRqezMe9OuKh5acQeVsFXCig3U61lEWwivRyyXDKwgTt7/BUkLj9B+cZjbFw
cvxo++tOof4GRFxTBmzXwCl2vC/3lN8i5PYMqGdo84yqmrg9FXuD2qh9RAJWM1KT
7raKqVEwQGtUHn0Bup05miHuq3qmMlVS7PUXW9z6CMLWDS2il272Tvz5u1YTPiBn
o41WGqPty+UtndS7pHi07AwaclpWZ0ixJKwL6PP8j/4hJ4juv1ctVaaG9uOR/buL
aDLyh1PDAgan22U4YpVBmo5UBXkIKBsM+NYShCRZ72I5O458DzF5qstXtl3tlqlW
INcXLK+JIQIDAQABo0IwQDAdBgNVHQ4EFgQUF2UkMn4zJX9ys6grwqtQF63NI8Yw
EgYDVR0TAQH/BAgwBgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQAD
ggGBAJ6LAqCoK9zzsN+GX/YvH3X9PYUAPNHMgveeY/ZA2pq/ff3VJEunV+23BF5X
YF86hy0xNZJHKmhPp6EJp/846erOYqLg+ozDBbEpaiF/xlFE+wn/dXV9D8EWnZUL
6pyAJjYW1pij51a5wTJ+0NbzxkhJ/NS9Va/oJGIUaUydfakljtHT0lpm2wAYuLap
0pFlHai0UkERywl+Qrd4m9DMN1xUzBal/sY8ZoVSh8HywRcweQ9HIx0+J5BJwkzZ
1Anm3TPoRGBqBozMpWBYSWqBYABvvIJp8j50O6dSS1GvVY2Px/VQFJ4rMHCHIKyx
xKaL+JTapkPklxEeZqiSY+URtDOY7KtgfGThifSineIIwek/KbmIScPmTERbN9YV
woNWfFBmlRas1kYPOiK9O10lIWp4Nuh+wsSpqd5ioN9/Kgh/+eKSmZTjE7WtZ7YJ
V6ZK35L18OasraaMdXmIrXTB5JMhQd8RTOWP0eWb8wiPMLdcYpiIkQA67od2D+Us
qjSu7Q==
-----END CERTIFICATE-----`,
    },
};

const client = new pg.Client(config);
client.connect(function (err) {
    if (err)
        throw err;
    client.query("SELECT VERSION()", [], function (err, result) {
        if (err)
            throw err;

        console.log(result.rows[0].version);
        client.end(function (err) {
            if (err)
                throw err;
        });
    });
});