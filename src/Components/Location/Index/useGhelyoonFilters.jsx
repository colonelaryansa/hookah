import { useState, useRef } from 'react'
import {
    Button,
    Input,
    Space,
    Dropdown,
    Select,
} from 'antd';
import {
    EyeOutlined,
    EditOutlined,
    CloseSquareFilled,
    MenuOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FaLocationDot, FaTrash } from "react-icons/fa6";
import { Link } from 'react-router-dom';

export default function useGhelyoonFilters(props) {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [filteredInfo, setFilteredInfo] = useState({});
    const searchInput = useRef(null);
    const {
        setLocationData,
        neighbours,
        tableParams,
        setTableParams,
        showDeleteModal,
    } = props

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const handleDirection = (direction) => {
        setSearchText(direction)
        setSearchedColumn('direction')
        setTableParams({
            filters: {
                direction: [direction],
                title: tableParams.filters ? tableParams.filters.title : null,
                district: tableParams.filters ? tableParams.filters.district : null,
                address: tableParams.filters ? tableParams.filters.address : null,
                neighbour: tableParams.filters ? tableParams.filters.neighbour : null
            },
            pagination: {
                ...tableParams.pagination,
                current: 1
            }
        });
        setFilteredInfo({ title: null, direction: [direction], district: null, address: null, neighbour: null })
    }

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });

        // `dataSource` is useless since `pageSize` changed
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setLocationData([]);
        }
    };

    const clearFilters = () => {
        setFilteredInfo({});
        setTableParams({
            pagination: {
                ...tableParams.pagination,
                pageSize: 10,
                current: 1
            }
        })
        setSearchText('')
        setSearchedColumn('')
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
            const searchDataIndexTitle = columns.find(o => o.dataIndex === dataIndex).title;
            return (
                <div
                    style={{
                        padding: 8,
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <Input
                        ref={searchInput}
                        placeholder={`جستجوی ${searchDataIndexTitle}`}
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        style={{
                            marginBottom: 8,
                            display: 'block',
                        }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{
                                width: 90,
                            }}
                        >
                            جستجو
                        </Button>
                        <Button
                            onClick={() => {
                                clearFilters()
                                clearFilters()
                                handleReset(clearFilters)
                            }}
                            size="small"
                            style={{
                                width: 90,
                            }}
                        >
                            بازنشانی
                        </Button>
                    </Space>
                </div>
            )
        },
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const availableDistricts = [...new Set(neighbours.map(neighbour => neighbour.district).sort())]
    const selectOptionGroupValue = availableDistricts.map((district) => {
        const districtNeighbours = neighbours.filter((neighbour) => neighbour.district === district)
        return {
            label: <span>منطقه {district}</span>,
            title: `منطقه ${district}`,
            options: districtNeighbours.map((neighbour) => ({ label: neighbour.title, value: neighbour.title }))
        }
    })

    const getNeighbourColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Select
                    showSearch
                    ref={searchInput}
                    value={selectedKeys[0]}
                    placeholder="جستجو محل"
                    allowClear={{
                        clearIcon: <CloseSquareFilled />,
                    }}
                    onChange={(value) => setSelectedKeys([value])}
                    options={selectOptionGroupValue}
                    style={{
                        width: "100%",
                        marginTop: 20,
                        marginBottom: 20,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        جستجو
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters()
                            clearFilters()
                            handleReset(clearFilters)
                        }}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        بازنشانی
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        /*    onFilterDropdownOpenChange: (visible) => {
               if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
              } 
            },*/
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const columns = [
        {
            title: 'عنوان',
            dataIndex: 'title',
            key: 'title',
            filteredValue: filteredInfo.title || null,
            ...getColumnSearchProps('title'),
        },
        {
            title: 'محله',
            dataIndex: 'neighbour',
            key: 'neighbour',
            filteredValue: filteredInfo.neighbour || null,
            ...getNeighbourColumnSearchProps('neighbour'),
        },
        {
            title: 'جهت',
            dataIndex: 'direction',
            key: 'direction',
            filteredValue: filteredInfo.direction || null,
            // ...getColumnSearchProps('direction'),
            filters: [
                {
                    text: 'شمال',
                    value: 'شمال',
                },
                {
                    text: 'غرب',
                    value: 'غرب',
                },
                {
                    text: 'مرکز',
                    value: 'مرکز',
                },
            ],
            onFilter: (value, record) => record.direction.indexOf(value) === 0,
        },
        {
            title: 'منطقه',
            dataIndex: 'district',
            key: 'district',
            filteredValue: filteredInfo.district || null,
            filters: availableDistricts.map(d => ({ text: d, value: d })),
            onFilter: (value, record) => record.district === value,
        },
        {
            title: 'آدرس',
            dataIndex: 'address',
            key: 'address',
            filteredValue: filteredInfo.address || null,
            ...getColumnSearchProps('address')
        },
        {
            title: 'عملیات',
            key: 'action',
            render: (text) => (
                <div>
                    <Dropdown className='dropdown-link'
                        trigger={['click']}
                        menu={{
                            items: [
                                {
                                    key: '1',
                                    label: (
                                        <Link to={`/location/${text.id}`}><EyeOutlined style={{ color: 'royalblue', fontSize: '18px' }} /> نمایش </Link>
                                    ),
                                },
                                {
                                    key: '2',
                                    label: (
                                        <Link to={`/location/${text.id}/edit`}><EditOutlined style={{ color: 'orange', fontSize: '18px' }} /> ویرایش </Link>
                                    ),
                                },
                                {
                                    key: '3',
                                    label: (
                                        <>
                                            {/* <div >/div> */}
                                            <div type="primary" onClick={() => showDeleteModal(text)}>
                                                <FaTrash style={{ color: 'red', fontSize: 18 }} /> حذف
                                            </div>
                                        </>
                                    ),
                                },
                                {
                                    key: '4',
                                    label: (
                                        <Link to={`/explore?coordinate=${text.coordinate}`} state={{ some: "value" }}><FaLocationDot style={{ color: 'green', fontSize: '18px' }} /> نمایش روی نقشه </Link>
                                    ),
                                },
                            ],
                        }}
                    >
                        <div style={{ cursor: 'pointer' }}>
                            <Space>
                                <MenuOutlined />
                            </Space>
                        </div>
                    </Dropdown>
                </div>
            ),
        },
    ];
    return { handleChange, columns, handleDirection, clearFilters };
}
