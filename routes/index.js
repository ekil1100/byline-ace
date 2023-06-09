export default function routes(app, addon) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json')
    })

    // This is an example route used by "generalPages" module (see atlassian-connect.json).
    // Verify that the incoming request is authenticated with Atlassian Connect.
    app.get('/hello-world', addon.authenticate(), (req, res) => {
        // Rendering a template is easy; the render method takes two params: the name of the component or template file, and its props.
        // Handlebars and jsx are both supported, but please note that jsx changes require `npm run watch-jsx` in order to be picked up by the server.
        res.render(
            'hello-world.hbs', // change this to 'hello-world.jsx' to use the Atlaskit & React version
            {
                title: 'Atlassian Connect',
                //, issueId: req.query['issueId']
                //, browserOnly: true // you can set this to disable server-side rendering for react views
            },
        )
    })

    // Add additional route handlers here...
    app.get('/approvals', addon.authenticate(), function (req, res) {
        //  Get the ACE HTTP Client which interfaces with our Confluence instance.
        var httpClient = addon.httpClient(req)
        var contentId = req.query['contentId']

        //  Using the client, check if the page we are currently viewing has a
        //  content property with a key of 'approvals'.
        //  We use the /rest/api/content/{contentId}/property/{key} endpoint here.
        httpClient.get(
            {
                url: '/rest/api/content/' + contentId + '/property/approvals',
            },
            function (err, responseApproval, approvalObj) {
                approvalObj = JSON.parse(approvalObj)
                console.log('approvalObj:', approvalObj)
                //  Setup all the parameters we need to pass through to our client.
                var propertyExists = approvalObj.statusCode !== 404
                console.log('propertyExists:', propertyExists)
                var allApprovals = propertyExists
                    ? approvalObj.value.approvedBy
                    : []
                var version = propertyExists ? approvalObj.version.number : null

                //  Render.
                return res.render('approvals', {
                    numberApprovedBy: allApprovals.length,
                    allApprovals: JSON.stringify(allApprovals),
                })
            },
        )
    })
}
