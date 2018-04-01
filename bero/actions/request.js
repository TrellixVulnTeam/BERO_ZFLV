import firebase from 'firebase';
import Expo from 'expo';
import GeoFire from 'geofire';
import {
  REQUEST_CREATE,
  REQUEST_UPDATE,
  REQUEST_FETCH_SUCCESS,
  REQUEST_STATUS_CREATE,
  REQUEST_STATUS_INPROGRESS,
  REQUEST_STATUS_LOADING,
  REQUEST_FETCH_SINGLE_SUCCESS,
  REQUEST_FETCH_ACCEPTED_SUCCESS,
  SAVE_EVENT_SUCCESS,
  FETCH_MESSAGES,
  SEND_MESSAGES,
  FETCH_SAVED,
  FETCH_EVENT,
  FETCH_KEY_NEAR,
} from './types';

export const requestUpdate = ({ prop, value }) => {
  return {
    type: REQUEST_UPDATE,
    payload: { prop, value }
  };
};

export const requestCreate = ({ topic, type, view, must_be, hero, detail, mark_position }, url) => {
  const { currentUser } = firebase.auth();
  var facebookUid = null;
  const requestDB = firebase.database().ref(`/requests`);
  var ownerName = currentUser.displayName;
  var owneruid = currentUser.uid;
  var owneremail = currentUser.email;
  currentUser.providerData.forEach(function (profile) {
    facebookUid = profile.uid;
  });

  return (dispatch) => {
    requestDB.push({
      'imageUrl': url,
      ownerName,
      owneruid,
      owneremail,
      'ownerprofilePicture': 'http://graph.facebook.com/' + facebookUid + '/picture?type=square',
      facebookUid,
      topic,
      type,
      view,
      must_be,
      hero,
      detail,
      mark_position,
      'requestType': 'Request',
      'status': 'in-progress',
      'when': Date.now(),
      heroAccepted: 0,
    })
      .then((result) => {
        var geoFire = new GeoFire(firebase.database().ref(`/geofire`));
        geoFire.set(result.key, [mark_position.latitude, mark_position.longitude])
        var ref = firebase.database().ref('users/' + owneruid);
        ref.update({
          "Profile/statusCreate": "in-progress",
          "Profile/requestCreate": result.key,
        }).then(() => {
          const chat = firebase.database().ref('chats/' + result.key)
          chat.push({
            '_id': 'system',
            'createdAt': Date.now(),
            'system': true,
            'text': "Hello from BERO",
          }).then(() => {
            const request = firebase.database().ref('requests/' + result.key)
            request.on('value', snapshot => {
              dispatch({
                type: REQUEST_FETCH_SINGLE_SUCCESS,
                payload: snapshot.val()
              });
            });
          })
        });
      });
  };
};

export const requestFetch = () => {
  const { currentUser } = firebase.auth()
  const request = firebase.database().ref(`/requests`)
  return (dispatch) => {
    request.orderByChild('status').equalTo('in-progress').on('value', snapshot => {
      dispatch({
        type: REQUEST_FETCH_SUCCESS,
        payload: snapshot.val()
      });
    });
  };
};

export const requestFetchNearKeys = (latitude, longitude) => {
  var geoFire = new GeoFire(firebase.database().ref(`/geofire`));
  var geoQuery = geoFire.query({
    center: [latitude, longitude],
    radius: 1
  });
  var keys = [];
  return (dispatch) => {
    geoQuery.on("key_entered", (key, location, distance) => {
      keys.push(key)
      dispatch({
        type: FETCH_KEY_NEAR,
        payload: keys
      })
    })
  }
}


export const requestFetchNear = (keys) => {
  console.log("key is" + keys)
  var array = [];
  return (dispatch) => {
    if (keys == null) {
      dispatch({
        type: REQUEST_FETCH_SUCCESS,
        payload: null
      })
    } else {
      var promises = keys.map(function (key) {
        return firebase.database().ref("/requests/").child(key).once("value");
      })
      Promise.all(promises).then(function (snapshots) {
        snapshots.forEach(function (snapshot) {
          if(snapshot.val().status=="done"){

          }else{
            var obj = snapshot.val()
          obj["uid"] = snapshot.key
          array.push(obj)
          }
        })
        dispatch({
          type: REQUEST_FETCH_SUCCESS,
          payload: array
        })
      })
    }
  }
}

export const requestFetchSingle = (requestId) => {
  const { currentUser } = firebase.auth()
  const request = firebase.database().ref('requests/' + requestId)
  return (dispatch) => {
    request.on('value', snapshot => {
      dispatch({
        type: REQUEST_FETCH_SINGLE_SUCCESS,
        payload: snapshot.val()
      });
    });
  };
};


export const requestFetchAccepted = (requestId) => {
  const { currentUser } = firebase.auth()
  const request = firebase.database().ref('requests/' + requestId)

  return (dispatch) => {
    request.on('value', snapshot => {
      dispatch({
        type: REQUEST_FETCH_ACCEPTED_SUCCESS,
        payload: snapshot.val()
      });
    });
  };
};

export const request_form = (requestId) => {
  const { currentUser } = firebase.auth();
  var owneruid = currentUser.uid;
  return dispatch => {
    var ref = firebase.database().ref('users/' + owneruid);
    ref.update({
      "Profile/statusCreate": "create",
    }).then(() => {
      if (requestId == null) {
        dispatch({ type: REQUEST_STATUS_CREATE })
      }
      else {
        var ref = firebase.database().ref('requests/' + requestId);
        ref.update({
          "status": "done",
        }).then(() => {
          dispatch({ type: REQUEST_STATUS_CREATE })
        })
      }
    });
  };
};

export const request_loading = () => {
  return dispatch => {
    dispatch({ type: REQUEST_STATUS_LOADING })
  };

}

export const request_inprogress = () => {
  return dispatch => {
    dispatch({ type: REQUEST_STATUS_INPROGRESS })
  };

}

export const save_event = (requestId) => {
  const { currentUser } = firebase.auth()
  var owneruid = currentUser.uid
  const request = firebase.database().ref('users/' + owneruid + '/Profile/saved')
  return () => {
    request.child(requestId).set({
      requestId,
    })
  };
};

export const fetch_saved = () => {
  const { currentUser } = firebase.auth()
  var owneruid = currentUser.uid
  var array = [];
  const saved = firebase.database().ref('users/' + owneruid + '/Profile/saved')
  return (dispatch) => {
    saved.once('value', snapshot => {
      if (snapshot.val() == null) {
        dispatch({
          type: FETCH_SAVED,
          payload: null
        })
      }
      else {
        keys = Object.keys(snapshot.val())
        var promises = keys.map(function (key) {
          return firebase.database().ref("/requests/").child(key).once("value");
        })
        Promise.all(promises).then(function (snapshots) {
          snapshots.forEach(function (snapshot) {
            var obj = snapshot.val()
            obj["uid"] = snapshot.key
            array.push(obj)
          })
          dispatch({
            type: FETCH_SAVED,
            payload: array
          })
        })
      }
    })
  }
}

export const delete_saved = (uid) => {
  const { currentUser } = firebase.auth()
  var owneruid = currentUser.uid
  const request = firebase.database().ref('users/' + owneruid + '/Profile/saved/' + uid)
  return () => {
    request.remove()
  }
}

export const fetch_messages = (requestId) => {
  const { currentUser } = firebase.auth()
  const chat = firebase.database().ref('chats/' + requestId)
  return (dispatch) => {
    chat.on('value', snapshot => {
      dispatch({
        type: FETCH_MESSAGES,
        payload: snapshot.val()
      });
    });
  };
};

export const fetch_event = () => {
  const { currentUser } = firebase.auth()
  const event = firebase.database().ref('requests/')
  return (dispatch) => {
    event.orderByChild('type').equalTo('Event').on('value', snapshot => {
      dispatch({
        type: FETCH_EVENT,
        payload: snapshot.val()
      });
    });
  };
};

export const send_messages = (message, requestId) => {
  const { currentUser } = firebase.auth()
  const chat = firebase.database().ref('chats/' + requestId)
  console.log(message[0])
  const text = message[0].text
  const _id = message[0]._id
  const createdAt = message[0].createdAt
  const user = message[0].user
  return (dispatch) => {
    chat.push({
      _id,
      'createdAt': Date.now(),
      text,
      user,
    }).then(() => {
      dispatch({ type: SEND_MESSAGES })
    })
  };
};