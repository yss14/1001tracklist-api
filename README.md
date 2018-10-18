# 1001tracklist-api
A small REST API providing some functionality to fetch data from `1001tracklist.com`.

## Documentation

### Base Url
The base url of the API service is `https://1001tracklist-api.azurewebsites.net/api/`.

### Search tracklists
`GET <baseurl>/tracklists?query=<yoursearchquery>`

**Response**

Content-Type: `application/json`

Body schema:
```
{
	"results": [
		{
			"title": string,
			"link": string
		},
		...
	]
}
```

**Example:** `https://1001tracklist-api.azurewebsites.net/api/tracklists?query=abgt300`

### Tracklist tracks
`GET <baseurl>/tracklist/tracks?tracklistURL=<tracklisturl>`

**Response**

Content-Type: `application/json`

Body schema:
```
{
	"tracks": [
		{
			"trackTitle": string,
			"timestamp": number | null
		},
		...
	]
}
```

**Example:** `https://1001tracklist-api.azurewebsites.net/api/tracklist/tracks?tracklistURL=https://www.1001tracklists.com/tracklist/2tlglsf9/ben-bohmer-abgt-300-asiaworld-expo-hong-kong-2018-09-29.html`

## Contribution
PR welcome ;)

## Authors
* Yannick Stachelscheid (yss14)