import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Axios from '../../Utils/Axios';

export default function Explore() {
    const [locations, setLocations] = useState([])
    let position = [35.746, 51.303]

    let searchParams = useLocation()
    let queryStrings = searchParams.search;
    if (queryStrings) {
        position = queryStrings.replace('?coordinate=', '').split(',')
    }


    useEffect(() => {
        Axios.get('location/map/explore')
            .then(({data}) => {setLocations(data);})
    }, [])

    return (
        <>
            <p>نقشه</p>
            <div className="map-wrapper">
                <MapContainer center={position} zoom={16} scrollWheelZoom={false}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {locations && locations.map((location, index) => {
                        return (
                            <Marker position={location.coordinate.split(',')} key={index}>
                                <Popup>
                                    <Link to={`/location/${location.id}`}>
                                        <p style={{ fontSize: 22 }}>{location.title}</p>
                                    </Link>
                                    {/* <Tooltip direction="bottom" offset={[0,20]} opacity="1" permanent>
                                        <p>tooltip</p>
                                    </Tooltip> */}
                                </Popup>
                            </Marker>
                        )
                    })}
                    <Marker position={position}>
                    </Marker>
                </MapContainer>
            </div>
        </>
    )
}