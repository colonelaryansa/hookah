import Axios from '../Utils/Axios';

export function getLocationById(id) {
	return Axios.get(`location/${id}`).then(({ data }) => data);
}

export function deleteLocation(id) {
	return Axios.delete(`location/${id}`);
}

export function getAllLocations(params) {
	return Axios.get(`location`, params);
}

export function updateLocation(id, params) {
	return Axios.put(`location/${id}`, params);
}

export function deletePhoto(id) {
	return Axios.delete(`location/photo/${id}`);
}

export function setThumbnailPhoto(locationId, photoId) {
	return Axios.post(`location/${locationId}/photo/${photoId}/set-thumbnail`);
}

export function createLocation(params) {
	return Axios.post('location', params);
}
