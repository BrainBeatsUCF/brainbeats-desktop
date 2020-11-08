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
const createBeatRoute = '/beat/create_beat'
const updateBeatRoute = '/beat/update_beat'
const deleteBeatRoute = '/beat/delete_beat'
const getOwnedBeatRoute = '/user/get_owned_beats'
const getAllBeatRoute = '/beat/get_all_beats'
const getLikedBeats = '/user/get_liked_beats'
const likeBeatRoute = '/user/like_vertex'
const unlikeBeatRoute = '/user/unlike_vertex'
const createSampleRoute = '/sample/create_sample'
const getOwnedSampleRoute = '/user/get_owned_samples'
const deleteSampleRoute = '/sample/delete_sample'
const getAllSampleRoute = '/sample/get_all_samples'
const getRecommendedBeatsRoute = '/user/get_recommended_beats'

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
  formData.append(emailKey, encodedBeatObject.email)
  formData.append(nameKey, encodedBeatObject.name)
  formData.append(privacyKey, encodedBeatObject.isPrivate)
  formData.append(instrumentListKey, encodedBeatObject.instrumentList)
  formData.append(attributesKey, encodedBeatObject.attributes)
  formData.append(durationKey, `${encodedBeatObject.duration}`)
  formData.append(audioKey, encodedBeatObject.audio, encodedBeatObject.audio.name)
  formData.append(imageKey, encodedBeatObject.image, encodedBeatObject.image.name)

  /// Make request
  const url = window.process.env[azureRouteKey] + createBeatRoute
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
    .then(response => {
      if (response.status !== 200) {
        onError()
      } else {
        return response.data
      }
    })
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
      if (
        error.response != undefined &&
        error.response.data.includes(expiredAuthorizationToken) &&
        (limit == undefined || limit == false)
      ) {
        RequestUserRefreshAuthentication(
          userInfo,
          _ => RequestCreateBeat(GetUserAuthInfo(), encodedBeatObject, onProgress, onComplete, onError, true),
          onError
        )
      } else {
        onError()
        console.error(error.response)
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
const RequestUpdateBeat = (userInfo, encodedBeatObject, onProgress, onComplete, onError, limit) => {
  /// Create form
  let formData = new FormData()
  formData.append(idKey, encodedBeatObject.id)
  formData.append(emailKey, encodedBeatObject.email)
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
  const url = window.process.env[azureRouteKey] + updateBeatRoute
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
    .then(response => {
      if (response.status !== 200) {
        onError()
      } else {
        return response.data
      }
    })
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
      if (
        error.response != undefined &&
        error.response.data.includes(expiredAuthorizationToken) &&
        (limit == undefined || limit == false)
      ) {
        RequestUserRefreshAuthentication(
          userInfo,
          _ => RequestUpdateBeat(GetUserAuthInfo(), encodedBeatObject, onProgress, onComplete, onError, true),
          onError
        )
      } else {
        onError()
        console.error(error.response)
      }
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(savedObject: [GridBeatObject]) => void} onComplete
 * @param {() => void} onError
 * @param {Boolean?} limit
 */
const RequestGetOwnedBeats = (userInfo, onComplete, onError, limit) => {
  const url = window.process.env[azureRouteKey] + getOwnedBeatRoute
  const requestBody = {
    email: userInfo.email,
  }
  axios
    .post(url, requestBody, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => {
      if (response.status !== 200) {
        onError()
      } else {
        return response.data
      }
    })
    .then(responseData => {
      const decodableBeatObjects = ParseBeatVertices(userInfo.email, responseData)
      const retrievedBeatObjects = decodableBeatObjects.map(decodableObject => decodeBeatObject(decodableObject))
      onComplete(retrievedBeatObjects)
    })
    .catch(error => {
      if (
        error.response != undefined &&
        error.response.data.includes(expiredAuthorizationToken) &&
        (limit == undefined || limit == false)
      ) {
        RequestUserRefreshAuthentication(
          userInfo,
          _ => RequestGetOwnedBeats(GetUserAuthInfo(), onComplete, onError, true),
          onError
        )
      } else {
        onError()
        console.error(error.response)
      }
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(savedObject: [GridBeatObject]) => void} onComplete
 * @param {() => void} onError
 * @param {Boolean?} limit
 */
const RequestGetAllBeats = (userInfo, onComplete, onError, limit) => {
  const url = window.process.env[azureRouteKey] + getAllBeatRoute
  const requestBody = {
    email: userInfo.email,
  }
  axios
    .post(url, requestBody, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => {
      if (response.status !== 200) {
        onError()
      } else {
        return response.data
      }
    })
    .then(responseData => {
      const decodableBeatObjects = ParseBeatVertices(userInfo.email, responseData)
      const retrievedBeatObjects = decodableBeatObjects.map(decodableObject => decodeBeatObject(decodableObject))
      onComplete(retrievedBeatObjects)
    })
    .catch(error => {
      if (
        error.response != undefined &&
        error.response.data.includes(expiredAuthorizationToken) &&
        (limit == undefined || limit == false)
      ) {
        RequestUserRefreshAuthentication(
          userInfo,
          _ => RequestGetAllBeats(GetUserAuthInfo(), onComplete, onError, true),
          onError
        )
      } else {
        onError()
        console.error(error.response)
      }
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(likedBeatIDs: Set) => void} onComplete
 * @param {Boolean?} limit
 */
const RequestGetLikedBeats = (userInfo, onComplete, limit) => {
  const url = window.process.env[azureRouteKey] + getLikedBeats
  const requestBody = {
    email: userInfo.email,
  }
  axios
    .post(url, requestBody, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => {
      if (response.status !== 200) {
        onError()
      } else {
        return response.data
      }
    })
    .then(responseData => {
      const decodableBeatObjects = ParseBeatVertices(userInfo.email, responseData)
      let likedBeatIDs = new Set()
      decodableBeatObjects.forEach(beatObject => likedBeatIDs.add(beatObject.id))
      onComplete(likedBeatIDs)
    })
    .catch(error => {
      if (
        error.response != undefined &&
        error.response.data.includes(expiredAuthorizationToken) &&
        (limit == undefined || limit == false)
      ) {
        RequestUserRefreshAuthentication(
          userInfo,
          _ => RequestGetLikedBeats(GetUserAuthInfo(), onComplete, true),
          onError
        )
      } else {
        onError()
        console.error(error.response)
      }
    })
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
  const url = window.process.env[azureRouteKey] + getRecommendedBeatsRoute
  const requestBody = {
    email: userInfo.email,
  }
  axios
    .post(url, requestBody, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => {
      if (response.status !== 200) {
        onError()
      } else {
        return response.data
      }
    })
    .then(responseData => {
      const decodableBeatObjects = ParseBeatVertices(userInfo.email, responseData)
      const retrievedBeatObjects = decodableBeatObjects.map(decodableObject => decodeBeatObject(decodableObject))
      onComplete(retrievedBeatObjects)
    })
    .catch(error => {
      if (
        error.response != undefined &&
        error.response.data.includes(expiredAuthorizationToken) &&
        (limit == undefined || limit == false)
      ) {
        RequestUserRefreshAuthentication(
          userInfo,
          _ => RequestGetRecommendedBeats(GetUserAuthInfo(), onComplete, onError, true),
          onError
        )
      } else {
        onError()
        console.error(error.response)
      }
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {GridBeatObject} beatObject
 * @param {(status: ResultStatus) => void} onComplete
 * @param {Boolean?} limit
 */
const RequestDeleteBeat = (userInfo, beatObject, onComplete, limit) => {
  const url = window.process.env[azureRouteKey] + deleteBeatRoute
  const requestBody = {
    email: userInfo.email,
    id: beatObject.beatID,
  }
  axios
    .post(url, requestBody, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
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
    return {
      id: singleVertex.id,
      email: email,
      name: properties.name[0].value,
      isPrivate: properties.isPrivate[0].value === 'False' ? false : true,
      attributes: properties.attributes[0].value,
      audio: properties.audio[0].value,
      image: properties.image[0].value,
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
  formData.append(emailKey, encodedSampleObject.email)
  formData.append(nameKey, encodedSampleObject.name)
  formData.append(privacyKey, encodedSampleObject.isPrivate)
  formData.append(attributesKey, encodedSampleObject.attributes)
  formData.append(audioKey, encodedSampleObject.audio, encodedSampleObject.audio.name)
  formData.append(imageKey, imageNameFromURL)

  /// Make Request
  const url = window.process.env[azureRouteKey] + createSampleRoute
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
    .then(response => {
      if (response.status !== 200) {
        onError()
      } else {
        return response.data
      }
    })
    .then(responseData => {
      const decodableSampleObjects = ParseSampleVertices(encodedSampleObject.email, responseData)
      let savedSampleObject = decodeSampleObject(decodableSampleObjects[0])
      onComplete(savedSampleObject)
    })
    .catch(error => {
      if (
        error.response != undefined &&
        error.response.data.includes(expiredAuthorizationToken) &&
        (limit == undefined || limit == false)
      ) {
        RequestUserRefreshAuthentication(
          userInfo,
          _ => RequestCreateSample(GetUserAuthInfo(), encodedSampleObject, onProgress, onComplete, onError, true),
          onError
        )
      } else {
        onError()
        console.log(error.response)
      }
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(ownedSamples: [GridSampleObject]) => void} onComplete
 * @param {() => void} onError
 * @param {Boolean?} limit
 */
const RequestGetOwnedSamples = (userInfo, onComplete, onError, limit) => {
  const url = window.process.env[azureRouteKey] + getOwnedSampleRoute
  const requestBody = {
    email: userInfo.email,
  }
  axios
    .post(url, requestBody, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => {
      if (response.status !== 200) {
        onError()
      } else {
        return response.data
      }
    })
    .then(responseData => {
      const decodableSampleObjects = ParseSampleVertices(userInfo.email, responseData)
      const retrievedSampleObjects = decodableSampleObjects.map(decodableSample => decodeSampleObject(decodableSample))
      onComplete(retrievedSampleObjects)
    })
    .catch(error => {
      if (
        error.response != undefined &&
        error.response.data.includes(expiredAuthorizationToken) &&
        (limit == undefined || limit == false)
      ) {
        RequestUserRefreshAuthentication(
          userInfo,
          _ => RequestGetOwnedSamples(GetUserAuthInfo(), onComplete, onError, true),
          onError
        )
      } else {
        onError()
        console.error(error.response)
      }
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(ownedSamples: [GridSampleObject]) => void} onComplete
 * @param {() => void} onError
 * @param {Boolean?} limit
 */
const RequestGetAllSamples = (userInfo, onComplete, onError, limit) => {
  const url = window.process.env[azureRouteKey] + getAllSampleRoute
  const requestBody = {
    email: userInfo.email,
  }
  axios
    .post(url, requestBody, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => {
      if (response.status !== 200) {
        onError()
      } else {
        return response.data
      }
    })
    .then(responseData => {
      const decodableSampleObjects = ParseSampleVertices(userInfo.email, responseData)
      const retrievedSampleObjects = decodableSampleObjects.map(decodableSample => decodeSampleObject(decodableSample))
      onComplete(retrievedSampleObjects)
    })
    .catch(error => {
      if (
        error.response != undefined &&
        error.response.data.includes(expiredAuthorizationToken) &&
        (limit == undefined || limit == false)
      ) {
        RequestUserRefreshAuthentication(
          userInfo,
          _ => RequestGetAllSamples(GetUserAuthInfo(), onComplete, onError, true),
          onError
        )
      } else {
        onError()
        console.error(error.response)
      }
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {GridSampleObject} sampleObject
 * @param {(status: ResultStatus) => void} onComplete
 * @param {Boolean?} limit
 */
const RequestDeleteSample = (userInfo, sampleObject, onComplete, limit) => {
  const url = window.process.env[azureRouteKey] + deleteSampleRoute
  const requestBody = {
    email: userInfo.email,
    id: sampleObject.sampleID,
  }
  axios
    .post(url, requestBody, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
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
          _ => RequestDeleteSample(GetUserAuthInfo(), sampleObject, onComplete, true),
          _ => onComplete(ResultStatus.Error)
        )
      } else {
        onComplete(ResultStatus.Error)
        console.error(error.response)
      }
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
