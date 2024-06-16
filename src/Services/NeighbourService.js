import Axios from '../Utils/Axios';

export function getAllNeighbours() {
	return Axios.get('neighbour').then(({ data }) => data);
}

export function updateNeighbour(id, params) {
	return Axios.put(`neighbour/${id}`, params);
}

export function createNeighbour(params) {
	return Axios.post('neighbour', params);
}

export function deleteNeighbour(id) {
	return Axios.delete(`neighbour/${id}`);
}