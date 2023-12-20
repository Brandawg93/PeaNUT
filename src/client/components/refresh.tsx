import { faCaretDown, faRefresh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { Menu, MenuHandler, MenuList, MenuItem, IconButton } from '@material-tailwind/react'

export default function Refresh(props: any) {
  const { onClick, onChange } = props
  const [refreshInterval, setRefreshInterval] = useState(localStorage.getItem('refreshInterval') || '0')

  const handleSelect = (event: any) => {
    const value = event.target.value
    setRefreshInterval(value)
    onChange(parseInt(value, 10))
    localStorage.setItem('refreshInterval', value)
  }

  const isActive = (value: string) => {
    return refreshInterval === value ? 'bg-blue-700 text-white' : ''
  }

  return (
    <>
      <IconButton variant='outlined' className='text-md rounded-r-none dark:text-gray-100 dark:border-gray-500' onClick={onClick}>
        <FontAwesomeIcon icon={faRefresh} />
      </IconButton>
      <Menu>
        <MenuHandler>
          <IconButton variant='outlined' className='text-md rounded-l-none dark:text-gray-100 dark:border-gray-500'>
            <FontAwesomeIcon icon={faCaretDown} />
          </IconButton>
        </MenuHandler>
        <MenuList className='dark:bg-gray-900 text-black dark:text-white'>
          <MenuItem className={`text-lg font-semibold ${isActive('0')}`} value={'0'} onClick={handleSelect}>
            off
          </MenuItem>
          <MenuItem className={`text-lg font-semibold ${isActive('1')}`} value={'1'} onClick={handleSelect}>
            1s
          </MenuItem>
          <MenuItem className={`text-lg font-semibold ${isActive('3')}`} value={'3'} onClick={handleSelect}>
            3s
          </MenuItem>
          <MenuItem className={`text-lg font-semibold ${isActive('5')}`} value={'5'} onClick={handleSelect}>
            5s
          </MenuItem>
          <MenuItem className={`text-lg font-semibold ${isActive('10')}`} value={'10'} onClick={handleSelect}>
            10s
          </MenuItem>
          <MenuItem className={`text-lg font-semibold ${isActive('30')}`} value={'30'} onClick={handleSelect}>
            30s
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  )
}
