import { Spin, Image, Col, Card, Typography, Row, Descriptions, Divider } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import NotificationContext from '../../../Contexts/Notification';
import Axios from '../../../Utils/Axios'
import { getLocationById } from '../../../Services/LocationService';

export default function Show() {
    const openNotification = useContext(NotificationContext)
    const { locationId } = useParams();
    const [spinning, setSpinning] = useState(true)
    const [location, setLocation] = useState(null)
    const [locationPosition, setLocationPosition] = useState(null)
    const [photos, setPhotos] = useState(null)
    useEffect(() => {
        setSpinning(true);
        getLocationById(locationId)
            .then(data => {
                setLocation([
                    {
                        key: 1,
                        label: "عنوان",
                        children: data.title
                    },
                    {
                        key: 2,
                        label: "محله",
                        children: data.neighbour
                    },
                    {
                        key: 3,
                        label: "منطقه",
                        children: data.district
                    },
                    {
                        key: 4,
                        label: "جهت",
                        children: data.direction
                    },
                    {
                        key: 5,
                        label: "نشانی",
                        children: data.address
                    },
                    {
                        key: 5,
                        label: "تلفن",
                        children: data.telephone
                    },
                    {
                        key: 6,
                        label: "تاریخ ایجاد",
                        children: data.created_at
                    },
                    {
                        key: 7,
                        label: "شناسه",
                        children: data.id
                    },
                ])
                setPhotos(data.photo)
                setLocationPosition(data.coordinate.split(','))
                setSpinning(false)
            })
            .catch((error) => {
                setSpinning(false)
                openNotification('error', 'سرور خطا دارد 💩')
            });
    }, [])
    return (
        <>
            <Spin spinning={spinning}>
                <Typography>گالری</Typography>
                <Row gutter={[16, 24]}>
                    {
                        photos && photos.map(photo => {
                            return (
                                <Col
                                    key={Math.random()}
                                    span={6}
                                >
                                    <Card
                                        title={
                                            <p>
                                                {photo.id}
                                            </p>
                                        }
                                        hoverable
                                        style={{
                                            width: "100%",
                                            // height: "600px"
                                        }}
                                    >
                                        <p>Card content</p>
                                        <Image
                                            width="100%"
                                            height={"250px"}
                                            src={photo.path}
                                        />
                                    </Card >
                                </Col>
                            )
                        })
                    }
                </Row>
                <Divider />
                <Descriptions title="مشخصات" bordered items={location} column={1} />
                <Divider />
                {
                    locationPosition &&
                    <div className="map-wrapper">
                        <MapContainer
                            center={locationPosition}
                            zoom={16}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={locationPosition} />
                        </MapContainer>
                    </div>
                }
            </Spin>
        </>
    )
}
