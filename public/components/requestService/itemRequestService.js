import axios from 'axios'
import bufferToWav from 'audiobuffer-to-wav'
import { VerifiedUserInfo, RequestUserRefreshAuthentication, GetUserAuthInfo } from './authRequestService'
import { ResultStatus } from './requestService'
import {
  GridBeatObject,
  GridSampleObject,
  EncodedBeatObject,
  DecodableBeatObject,
  EncodedSampleObject,
  DecodableSampleObject,
  decodeBeatObject,
  decodeSampleObject,
  encodeSampleObject,
} from '../panel/workstationPanel/gridObjects'

const imageURLPrefix = 'https://brainbeatsstorage.blob.core.windows.net/static/'

/// Request Keys
const idKey = 'id'
const emailKey = 'email'
const nameKey = 'name'
const privacyKey = 'isPrivate'
const instrumentListKey = 'instrumentList'
const attributesKey = 'attributes'
const durationKey = 'duration'
const audioKey = 'audio'
const imageKey = 'image'

/// Request APIs and Routes
const azureRouteKey = 'BRAINBEATS_AZURE_API_URL'
const createBeatRoute = '/v2/beats/create/'
const updateBeatRoute = '/v2/beats/update/'
const deleteBeatRoute = '/v2/beats/delete/'
const getAllBeatRoute = '/v2/beats'
const getLikedBeats = '/v2/users/'
const getOwnedBeatRoute = '/v2/users/'
const getRecommendedBeatsRoute = '/v2/users/'
const likeBeatRoute = '/user/like_vertex'
const unlikeBeatRoute = '/user/unlike_vertex'
const createSampleRoute = '/v2/samples/create/'
const deleteSampleRoute = '/v2/samples/delete/'
const getAllSampleRoute = '/v2/samples'
const getOwnedSampleRoute = '/v2/users/'
const urlBaseRoute = window.process.env[azureRouteKey]

/// Request Error Messages
const expiredAuthorizationToken = 'The token is expired'

/**
 * @param {String} email
 * @param {Dict} responseData
 * @return {DecodableBeatObject}
 */
const ParseBeatVertex = (email, responseData) => {
  const firstObject = responseData[0]
  const properties = firstObject.properties
  return {
    email: email,
    id: firstObject.id,
    name: properties.name[0].value,
    isPrivate: properties.isPrivate[0].value === 'False' ? false : true,
    instrumentList: properties.instrumentList[0].value,
    attributes: properties.attributes[0].value,
    duration: properties.duration[0].value,
    audio: properties.audio[0].value,
    image: properties.image[0].value,
  }
}

/**
 * @param {String} email
 * @param {[Dict]} responseData
 * @return {[DecodableBeatObject]}
 */
const ParseBeatVertices = (email, responseData) => {
  return responseData.map(singleVertex => {
    const properties = singleVertex.properties
    const owner = singleVertex.owner
    return {
      email: email,
      id: singleVertex.id,
      name: properties.name[0].value,
      isPrivate: properties.isPrivate[0].value === 'False' ? false : true,
      instrumentList: properties.instrumentList[0].value,
      attributes: properties.attributes[0].value,
      duration: properties.duration[0].value,
      audio: properties.audio[0].value,
      image: properties.image[0].value,
      ownerName: owner != undefined || owner != null ? owner.properties.name[0].value : 'Anonymous',
    }
  })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {EncodedBeatObject} encodedBeatObject
 * @param {(progress: String) => void} onProgress
 * @param {(savedObject: GridBeatObject) => void} onComplete
 * @param {() => void} onError
 * @param {Boolean?} limit
 */
const RequestCreateBeat = (userInfo, encodedBeatObject, onProgress, onComplete, onError) => {
  /// Create form
  let formData = new FormData()
  formData.append(nameKey, encodedBeatObject.name)
  formData.append(privacyKey, encodedBeatObject.isPrivate)
  formData.append(instrumentListKey, encodedBeatObject.instrumentList)
  formData.append(attributesKey, encodedBeatObject.attributes)
  formData.append(durationKey, `${encodedBeatObject.duration}`)
  formData.append(audioKey, encodedBeatObject.audio, encodedBeatObject.audio.name)
  formData.append(imageKey, encodedBeatObject.image, encodedBeatObject.image.name)

  /// Make request
  const url = urlBaseRoute + createBeatRoute + encodedBeatObject.email
  axios
    .post(url, formData, {
      onUploadProgress(progressEvent) {
        const progress = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2)
        onProgress(`Upload Progress... ${progress}%`)
      },
      headers: {
        Authorization: `Bearer ${userInfo.authToken}`,
      },
    })
    .then(response => response.data)
    .then(responseData => {
      if (responseData.length == undefined || responseData.length != 1) {
        onError()
      } else {
        const decodableBeatObject = ParseBeatVertex(encodedBeatObject.email, responseData)
        const savedBeatObject = decodeBeatObject(decodableBeatObject)
        onComplete(savedBeatObject)
      }
    })
    .catch(error => {
      onError()
      console.error(error.response)
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {EncodedBeatObject} encodedBeatObject
 * @param {(progress: String) => void} onProgress
 * @param {(savedObject: GridBeatObject) => void} onComplete
 * @param {() => void} onError
 * @param {Boolean?} limit
 */
const RequestUpdateBeat = (userInfo, encodedBeatObject, onProgress, onComplete, onError, limit) => {
  /// Create form
  let formData = new FormData()
  formData.append(nameKey, encodedBeatObject.name)
  formData.append(privacyKey, encodedBeatObject.isPrivate)
  formData.append(instrumentListKey, encodedBeatObject.instrumentList)
  formData.append(attributesKey, encodedBeatObject.attributes)
  formData.append(durationKey, `${encodedBeatObject.duration}`)

  /// possible for audio and/or image to be null when not being updated
  if (encodedBeatObject.audio != null || encodedBeatObject.audio != undefined) {
    formData.append(audioKey, encodedBeatObject.audio, encodedBeatObject.audio.name)
  }
  if (encodedBeatObject.image != null || encodedBeatObject.image != undefined) {
    formData.append(imageKey, encodedBeatObject.image, encodedBeatObject.image.name)
  }

  /// Make request
  const url = urlBaseRoute + updateBeatRoute + encodedBeatObject.id
  axios
    .put(url, formData, {
      onUploadProgress(progressEvent) {
        const progress = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2)
        onProgress(`Upload Progress... ${progress}%`)
      },
      headers: {
        Authorization: `Bearer ${userInfo.authToken}`,
      },
    })
    .then(response => response.data)
    .then(responseData => {
      if (responseData.length == undefined || responseData.length != 1) {
        onError()
      } else {
        const decodableBeatObject = ParseBeatVertex(encodedBeatObject.email, responseData)
        const savedBeatObject = decodeBeatObject(decodableBeatObject)
        onComplete(savedBeatObject)
      }
    })
    .catch(error => {
      onError()
      console.error(error.response)
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(savedObject: [GridBeatObject]) => void} onComplete
 * @param {() => void} onError
 * @param {Boolean?} limit
 */
const RequestGetOwnedBeats = (userInfo, onComplete, onError, limit) => {
  const url = urlBaseRoute + getOwnedBeatRoute + userInfo.email + '/owned_by?type=beat'
  axios
    .get(url, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => response.data)
    .then(responseData => {
      const decodableBeatObjects = ParseBeatVertices(userInfo.email, responseData)
      const retrievedBeatObjects = decodableBeatObjects.map(decodableObject => decodeBeatObject(decodableObject))
      onComplete(retrievedBeatObjects)
    })
    .catch(error => {
      onError()
      console.error(error.response)
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(savedObject: [GridBeatObject]) => void} onComplete
 * @param {() => void} onError
 * @param {Boolean?} limit
 */
const RequestGetAllBeats = (userInfo, onComplete, onError, limit) => {
  const url = urlBaseRoute + getAllBeatRoute
  axios
    .get(url, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => response.data)
    .then(responseData => {
      const decodableBeatObjects = ParseBeatVertices(userInfo.email, responseData)
      const retrievedBeatObjects = decodableBeatObjects.map(decodableObject => decodeBeatObject(decodableObject))
      onComplete(retrievedBeatObjects)
    })
    .catch(error => {
      onError()
      console.error(error.response)
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(likedBeatIDs: Set) => void} onComplete
 * @param {Boolean?} limit
 */
const RequestGetLikedBeats = (userInfo, onComplete, limit) => {
  const url = urlBaseRoute + getLikedBeats + userInfo.email + '/likes?type=beat'
  axios
    .get(url, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => response.data)
    .then(responseData => {
      const decodableBeatObjects = ParseBeatVertices(userInfo.email, responseData)
      let likedBeatIDs = new Set()
      decodableBeatObjects.forEach(beatObject => likedBeatIDs.add(beatObject.id))
      onComplete(likedBeatIDs)
    })
    .catch(error => console.error(error, error.response))
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {String} beatId
 * @param {Boolean} shouldLike
 * @param {() => void} onComplete
 * @param {Boolean?} limit
 */
const RequestLikeUnlikeBeat = (userInfo, beatId, shouldLike, onComplete, limit) => {
  const url = window.process.env[azureRouteKey] + (shouldLike ? likeBeatRoute : unlikeBeatRoute)
  const requestBody = {
    email: userInfo.email,
    vertexId: beatId,
  }
  axios
    .post(url, requestBody, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => {
      if (response.status === 200) {
        return response.data
      }
    })
    .then(_ => {
      onComplete()
    })
    .catch(error => {
      if (
        error.response != undefined &&
        error.response.data.includes(expiredAuthorizationToken) &&
        (limit == undefined || limit == false)
      ) {
        RequestUserRefreshAuthentication(
          userInfo,
          _ => RequestLikeUnlikeBeat(GetUserAuthInfo(), beatId, shouldLike, onComplete, true),
          _ => {} // error callback
        )
      } else {
        console.error(error.response)
      }
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(savedObjects: [GridBeatObject]) => void} onComplete
 * @param {() => void} onError
 * @param {Boolean?} limit
 */
const RequestGetRecommendedBeats = (userInfo, onComplete, onError, limit) => {
  const url = urlBaseRoute + getRecommendedBeatsRoute + userInfo.email + '/recommended?type=beat'
  axios
    .get(url, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => response.data)
    .then(responseData => {
      const decodableBeatObjects = ParseBeatVertices(userInfo.email, responseData)
      const retrievedBeatObjects = decodableBeatObjects.map(decodableObject => decodeBeatObject(decodableObject))
      onComplete(retrievedBeatObjects)
    })
    .catch(error => {
      onError()
      console.error(error.response)
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {GridBeatObject} beatObject
 * @param {(status: ResultStatus) => void} onComplete
 * @param {Boolean?} limit
 */
const RequestDeleteBeat = (userInfo, beatObject, onComplete, limit) => {
  const url = urlBaseRoute + deleteBeatRoute + beatObject.beatID
  axios
    .delete(url, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => {
      if (response.status !== 200) {
        onComplete(ResultStatus.Error)
      } else {
        onComplete(ResultStatus.Success)
      }
    })
    .catch(error => {
      if (
        error.response != undefined &&
        error.response.data.includes(expiredAuthorizationToken) &&
        (limit == undefined || limit == false)
      ) {
        RequestUserRefreshAuthentication(
          userInfo,
          _ => RequestDeleteBeat(GetUserAuthInfo(), beatObject, onComplete, true),
          _ => onComplete(ResultStatus.Error)
        )
      } else {
        onComplete(ResultStatus.Error)
        console.error(error.response)
      }
    })
}

/// Sample Requests

/**
 * @param {[Dict]} sampleVertices
 * @return {[DecodableSampleObject]}
 */
const ParseSampleVertices = (email, sampleVertices) => {
  return sampleVertices.map(singleVertex => {
    const properties = singleVertex.properties
    const owner = singleVertex.owner
    return {
      id: singleVertex.id,
      email: email,
      name: properties.name[0].value,
      isPrivate: properties.isPrivate[0].value === 'False' ? false : true,
      attributes: properties.attributes[0].value,
      audio: properties.audio[0].value,
      image: properties.image[0].value,
      ownerName: owner == undefined || owner == null ? 'Unknown' : owner.id,
    }
  })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {Number} index
 * @param {[GridSampleObject]} previousSamples
 * @param {[GridSampleObject]} gridSampleObjects
 * @param {(progress: String) => void} onProgress
 * @param {(savedSamples: [GridSampleObject]) => void} onComplete
 * @param {() => void} onError
 */
const RequestCreateSamples = (userInfo, index, gridSampleObjects, previousSamples, onProgress, onComplete, onError) => {
  if (index >= gridSampleObjects.length) {
    onComplete(previousSamples)
    return
  }

  /// Convert audio binary to file
  const currentSampleObject = gridSampleObjects[index]
  onProgress(`Preparing (${currentSampleObject.sampleTitle}) ...`)
  const retrievedWavBuffer = bufferToWav(currentSampleObject.sampleAudioBuffer)
  const retrievedWavBlob = new window.Blob([new DataView(retrievedWavBuffer)], { type: 'audio/wav' })
  const retrievedWavFile = new File([retrievedWavBlob], currentSampleObject.sampleTitle + '.wav')
  const encodedSampleObject = encodeSampleObject(userInfo, currentSampleObject, retrievedWavFile)

  /// Start upload process
  /// Important to always get the latest user auth info because one of these could fail due to
  /// an expired token and we want this recursion to be able to self recover
  RequestCreateSample(
    GetUserAuthInfo(),
    encodedSampleObject,
    onProgress,
    newSavedSample => {
      previousSamples.push(newSavedSample)
      RequestCreateSamples(
        GetUserAuthInfo(),
        index + 1,
        gridSampleObjects,
        previousSamples,
        onProgress,
        onComplete,
        onError
      )
    },
    onError,
    false
  )
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {EncodedSampleObject} encodedSampleObject
 * @param {(progress: String) => void} onProgress
 * @param {(savedSample: GridSampleObject) => void} onComplete
 * @param {() => void} onError
 * @param {Boolean?} limit
 */
const RequestCreateSample = (userInfo, encodedSampleObject, onProgress, onComplete, onError, limit) => {
  /// take out image prefix + .png and .jpg extension
  const imageNameFromURL = encodedSampleObject.image.slice(imageURLPrefix.length).slice(0, -4)

  /// Create form data
  let formData = new FormData()
  formData.append(nameKey, encodedSampleObject.name)
  formData.append(privacyKey, encodedSampleObject.isPrivate)
  formData.append(attributesKey, encodedSampleObject.attributes)
  formData.append(audioKey, encodedSampleObject.audio, encodedSampleObject.audio.name)
  formData.append(imageKey, imageNameFromURL)

  /// Make Request
  const url = urlBaseRoute + createSampleRoute + encodedSampleObject.email
  axios
    .post(url, formData, {
      onUploadProgress(progressEvent) {
        const progress = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2)
        onProgress(`Upload Progress (${encodedSampleObject.name}) ... ${progress}%`)
      },
      headers: {
        Authorization: `Bearer ${userInfo.authToken}`,
      },
    })
    .then(response => response.data)
    .then(responseData => {
      const decodableSampleObjects = ParseSampleVertices(encodedSampleObject.email, responseData)
      let savedSampleObject = decodeSampleObject(decodableSampleObjects[0])
      onComplete(savedSampleObject)
    })
    .catch(error => {
      onError()
      console.log(error, error.response)
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(ownedSamples: [GridSampleObject]) => void} onComplete
 * @param {() => void} onError
 * @param {Boolean?} limit
 */
const RequestGetOwnedSamples = (userInfo, onComplete, onError, limit) => {
  const url = urlBaseRoute + getOwnedSampleRoute + userInfo.email + '/owned_by?type=sample'
  axios
    .get(url, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => response.data)
    .then(responseData => {
      const decodableSampleObjects = ParseSampleVertices(userInfo.email, responseData)
      const retrievedSampleObjects = decodableSampleObjects
        .map(decodableSample => decodeSampleObject(decodableSample))
        .filter(decodedSample => decodedSample.sampleID != undefined || decodedSample.sampleID != null)
      onComplete(retrievedSampleObjects)
    })
    .catch(error => {
      onError()
      console.error(error, error.response)
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(ownedSamples: [GridSampleObject]) => void} onComplete
 * @param {() => void} onError
 * @param {Boolean?} limit
 */
const RequestGetAllSamples = (userInfo, onComplete, onError, limit) => {
  const url = urlBaseRoute + getAllSampleRoute
  axios
    .get(url, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => response.data)
    .then(responseData => {
      const decodableSampleObjects = ParseSampleVertices(userInfo.email, responseData)
      const retrievedSampleObjects = decodableSampleObjects.map(decodableSample => decodeSampleObject(decodableSample))
      onComplete(retrievedSampleObjects)
    })
    .catch(error => {
      onError()
      console.error(error, error.response)
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {GridSampleObject} sampleObject
 * @param {(status: ResultStatus) => void} onComplete
 * @param {Boolean?} limit
 */
const RequestDeleteSample = (userInfo, sampleObject, onComplete, limit) => {
  const url = urlBaseRoute + deleteSampleRoute + sampleObject.sampleID
  axios
    .delete(url, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(_ => onComplete(ResultStatus.Success))
    .catch(error => {
      onComplete(ResultStatus.Error)
      console.error(error.response)
    })
}

export {
  RequestUpdateBeat,
  RequestCreateBeat,
  RequestDeleteBeat,
  RequestGetOwnedBeats,
  RequestGetAllBeats,
  RequestGetRecommendedBeats,
  RequestGetLikedBeats,
  RequestLikeUnlikeBeat,
  RequestCreateSamples,
  RequestGetOwnedSamples,
  RequestGetAllSamples,
  RequestDeleteSample,
  VerifiedUserInfo,
  ResultStatus,
}
