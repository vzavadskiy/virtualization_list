import './App.css'

const items = Array.from({length: 1000}).map((_, index) => index)

export const  App = () =>  {

  return (
      <div className="container">
          {
              items.map((item) => {
                  return (
                      <div
                          className={'item'}
                          style={{background: item % 2 ? '#AAA' : '#777'}}
                      >
                          {item}
                      </div>
                  )
              })
          }
      </div>
  )
}

