import { Button, Form, Input, Spin, Select, Divider, Upload, Space, message, Popconfirm, Typography, Row, Col } from 'antd';
import { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useMapEvents } from 'react-leaflet/hooks'
import { useParams } from 'react-router-dom';
import { Card, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons'
import NotificationContext from '../../../Contexts/Notification';
import { getAllNeighbours } from '../../../Services/NeighbourService';
import { getLocationById, updateLocation } from '../../../Services/LocationService';
import ValidationRuleGenerator from '../../../Utils/ValidationRuleGenerator';
import { setThumbnailPhoto,deletePhoto } from '../../../Services/LocationService';

export default function Edit() {
    const { locationId } = useParams();
    const [spinning, setSpinning] = useState(true)
    const [form] = Form.useForm();
    const [neighbours, setNeighbours] = useState([])
    const [location, setLocation] = useState(null)
    const [clickedPosition, setClickedPosition] = useState(null)
    const openNotification = useContext(NotificationContext)

    const availableDistricts = [...new Set(neighbours.map(neighbour => neighbour.district).sort())]
    const selectOptionGroupValue = availableDistricts.map((district) => {
        const districtNeighbours = neighbours.filter((neighbour) => neighbour.district === district)
        return {
            label: <span>منطقه {district}</span>,
            title: `منطقه ${district}`,
            options: districtNeighbours.map((neighbour) => ({ label: neighbour.title, value: neighbour.title }))
        }
    })

    function LocationMarker() {
        let map = useMapEvents({
            click(e) {
                setClickedPosition(e.latlng)
                const formCoordinateValue = `${e.latlng.lat},${e.latlng.lng}`;
                form.setFieldValue('coordinate', formCoordinateValue)
            },
        })
        map.setView(clickedPosition)
        return <Marker position={clickedPosition}></Marker>
    }

    useEffect(() => {
        getAllNeighbours().then(data => setNeighbours(data))
        setSpinning(true);
        fetchLocation()
    }, [])

    const handleUploadChange = (info) => {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            openNotification('success', `تصویر بارگذاری شد`)
            fetchLocation()
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    }
    
    const fetchLocation = () => {
        setSpinning(true)
        getLocationById(locationId)
            .then((data) => {
                data['neighbour_id'] = data.neighbour
                form.setFieldsValue(data)
                setClickedPosition(data.coordinate.split(','))
                setLocation(data)
                setSpinning(false)
            })
            .catch(() => {
                setSpinning(false)
                openNotification('error', 'سرور خطا دارد 💩')
            });
    }

    const getNeighbourIdByTitle = (title) => {
        let target = neighbours.find((n) => n.title === title)
        if (!target) {
            throw Error('Neighbour Not Found')
        }
        return target.id
    }

    const onFinish = (values) => {
        if (typeof values.neighbour_id === "string") {
            values.neighbour_id = getNeighbourIdByTitle(values.neighbour_id)
        }
        setSpinning(true)
        updateLocation(locationId, values)
            .then((response) => {
                setSpinning(false)
                if (response.statusText === 'OK') {
                    openNotification('success', 'عملیات با موفقیت انجام شد')
                } else {
                    openNotification('error', 'عملیات با خطا مواجه شد')
                }
                setSpinning(false)
                fetchLocation()
            })
            .catch(() => {
                setSpinning(false)
                openNotification('error', 'سرور خطا دارد 💩')
            });
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const deleteLocationPhoto = (photoId) => {
        setSpinning(true)
        return new Promise((resolve) => {
            deletePhoto(photoId)
                .then(response => {
                    if (response.statusText == 'No Content') {
                        setSpinning(false)
                        openNotification('success', 'تصویر حذف شد')
                        fetchLocation()
                        resolve(null)
                    }
                })
                .catch(() => {
                    setSpinning(false)
                    openNotification('error', 'سرور خطا دارد 💩')
                    fetchLocation()
                    resolve(null)
                });
        });
    }
    const setLocationThumbnailPhoto = (photoId) => {
        setSpinning(true)
        return new Promise((resolve) => {
            setThumbnailPhoto(locationId, photoId)
                .then(response => {
                    if (response.statusText == 'OK') {
                        setSpinning(false)
                        openNotification('success', 'تصویر بندانگشتی ثبت شد')
                        fetchLocation()
                        resolve(null)
                    }
                })
                .catch(() => {
                    setSpinning(false)
                    openNotification('error', 'سرور خطا دارد 💩')
                    fetchLocation()
                    resolve(null)
                });
        });
    }
    const removeMarker = () => {
        setClickedPosition(null)
        setClickedPosition(location.coordinate.split(','))
    }
    return (
        <>
            <div style={{ width: "100%", height: "50vh" }}>
                {
                    clickedPosition &&
                    <MapContainer
                        center={clickedPosition}
                        zoom={16}
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker />
                    </MapContainer>
                }
            </div>
            <br></br>
            <div className="form-wrapper">
                <Row>
                    <Col span={10}>
                        <Form
                            form={form}
                            name="basic"
                            initialValues={{
                                remember: true,
                            }}
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                            requiredMark={false}
                        >

                            <Form.Item
                                label="عنوان"
                                name="title"
                                hasFeedback
                                validateFirst
                                // validateDebounce={1000}
                                rules={
                                    ValidationRuleGenerator({
                                        label: "عنوان",
                                        max: 100,
                                        patternType: "persianLetter"
                                    })
                                }
                            >
                                <Input
                                    showCount
                                    maxLength={100}
                                />
                            </Form.Item>
                            <Form.Item
                                label="محله"
                                name="neighbour_id"
                                hasFeedback
                                validateFirst
                                rules={[
                                    {
                                        required: true,
                                        message: 'وارد کردن محله الزامی است',
                                    },
                                ]}
                            >
                                <Select showSearch options={selectOptionGroupValue} />
                            </Form.Item>
                            <Form.Item
                                label="تلفن"
                                name="telephone"
                                hasFeedback
                                validateFirst
                                rules={
                                    ValidationRuleGenerator({
                                        label: "عنوان",
                                        max: 100,
                                        min: 8,
                                        patternType: "digit"
                                    })
                                }
                            >
                                <Input
                                    showCount
                                    maxLength={20}
                                />
                            </Form.Item>
                            <Form.Item
                                label="نشانی"
                                name="address"
                                hasFeedback
                                validateFirst
                                rules={
                                    ValidationRuleGenerator({
                                        label: "نشانی",
                                        max: 100,
                                        min: 5,
                                        patternType: "persianLetter"
                                    })
                                }
                            >
                                <Input.TextArea
                                    showCount
                                    maxLength={255}
                                />
                            </Form.Item>
                            <Form.Item

                                label="مختصات"
                                name="coordinate"
                                hasFeedback
                                validateFirst
                                rules={[
                                    {
                                        required: true,
                                        message: 'انتخاب روی نقشه الزامی است',
                                    },
                                    {
                                        max: 50,
                                    },
                                ]}
                            >
                                <Input
                                    disabled={false}
                                    showCount
                                    maxLength={50}
                                    placeholder='روی نقشه انتخاب کنید'
                                />
                            </Form.Item>
                            <Form.Item
                                wrapperCol={{
                                    offset: 1,
                                    span: 24,
                                }}
                            >
                                <Space>
                                    {/* <SubmitButton form={form}>ثبت</SubmitButton> */}
                                    <Button type='primary' htmlType='submit'>
                                        ثبت
                                    </Button>
                                    <Button type="primary" danger htmlType="reset" onClick={removeMarker}>
                                        بازنشانی
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form >
                    </Col>
                </Row>
            </div >
            <Divider />
            <p>تصاویر کافه</p>
            <div style={{ marginBottom: 100 }}>
                <Upload
                    action={import.meta.env.VITE_BASE_URL + `location/${locationId}/photo`}
                    // listType="picture"
                    accept="image/*"
                    headers={{
                        "Accept": "application/json"
                        // "Accept": "text/html"
                    }}
                    multiple
                    name="photo"
                    onChange={handleUploadChange}
                >
                    <Button icon={<UploadOutlined />}>بارگذاری تصاویر</Button>
                </Upload>
            </div >
            <div>
                <Typography>گالری</Typography>
                <Row gutter={[16, 24]}>
                    {
                        location && location.photo.map((photo, index) => (
                            <Col
                                key={index}
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
                                    <Divider />
                                    <div>
                                        <Space>
                                            <Popconfirm title="آیا حذف می می کنید ؟" onConfirm={() => (deleteLocationPhoto(photo.id))}>
                                                <Button type='primary' danger>حذف</Button>
                                            </Popconfirm>
                                            <Popconfirm title="آیا تایید می کنید ؟" onConfirm={() => (setLocationThumbnailPhoto(photo.id))}>
                                                <Button type='primary' disabled={photo.is_thumbnail}>انتخاب بعنوان بندانگشتی</Button>
                                            </Popconfirm>
                                        </Space>
                                    </div>
                                </Card >
                            </Col>
                        ))
                    }
                </Row>
            </div>
            <Spin spinning={spinning} fullscreen />
        </>
    )
}
