import { useState } from 'react'

const InputBox = ({ name, type, id, value, placeholder, icon }) => {
  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <div className="relative w-[100%] mb-4">
      <input
        name={name}
        type={
          type === 'password' ? (passwordVisible ? 'text' : 'password') : type
        }
        id={id}
        defaultValue={value}
        placeholder={placeholder}
        className="input-box"
      />

      <i className={'fi ' + icon + ' input-icon'}></i>

      {type === 'password' && (
        <i
          className={
            `fi ${passwordVisible ? 'fi-rr-eye-crossed' : 'fi-rr-eye'} ` +
            'input-icon left-[auto] right-4 cursor-pointer'
          }
          onClick={() => setPasswordVisible(currentVal => !currentVal)}
        ></i>
      )}
    </div>
  )
}

export default InputBox
