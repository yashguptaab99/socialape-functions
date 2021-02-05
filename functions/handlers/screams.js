const { db } = require('../utils/admin');

exports.getAllScream = (request, response) => {
    db.collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
        let screams = [];
        data.forEach((doc) => {
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                crearedAt: doc.data().createdAt,
                likeCount: doc.data().likeCount,
                commentCount: doc.data().commentCount 
            });
        });
        return response.json(screams);
    })
    .catch((err) => {
        console.error(err)
        response.status(500).json({ error : err.code })
    });
}

exports.postOneScream = (request, response) => {

    if (request.body.body.trim() === "") {
        return response.status(400).json({ body: "Body of scream cannot be empty" });
    }

    const newScream = {
        body: request.body.body,
        userHandle: request.user.handle,
        createdAt: new Date().toISOString()
    };

    db.collection('screams')
    .add(newScream)
    .then((doc) => {
        response.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
        response.status(500).json({ error: "Something went wrong" });
        console.error(err);
    });

}

exports.getScream = (request, response) => {
    let screamData = {};
    db.doc(`/screams/${request.params.screamId}`)
        .get()
        .then((doc) => {
            if(!doc.exists){
                return response.status(404).json({error : "Scream not found!"});
            }

            screamData = doc.data();
            screamData.screamId = doc.id;
            return db   
                .collection('comments')
                .orderBy('createdAt', 'desc')
                .where('screamId', "==", request.params.screamId)
                .get();
        })
        .then((data) => {
            screamData.comments = [];
            data.forEach((doc) => {
                screamData.comments.push(doc.data());
            });
            return response.json(screamData);
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({error : err.code});
        });
};