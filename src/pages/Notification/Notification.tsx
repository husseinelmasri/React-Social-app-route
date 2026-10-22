import { useState, useMemo } from 'react';
import { Button } from '@heroui/react';

function Notification() {
  const [counter1, setCounter1] = useState(1);
  const [counter2, setCounter2] = useState(2);

  const isCounter2Even = useMemo(() => {
    console.log('hello');
    return counter2 % 2 === 0;
  }, [counter2]);

  function changeC1() {
    setCounter1(counter1 + 1);
  }

  function changeC2() {
    setCounter2(counter2 + 1);
  }

  return (
    <div>
      <title>Social App | Notification</title>
      <div className="container mx-auto">
        <div className="grid grid-cols-2">
          <div>
            <h1>Counter 1</h1>
            <h2>{counter1}</h2>
            <Button onClick={changeC1}>change counter 1</Button>
          </div>
          <div>
            <h1>Counter 2</h1>
            <h2>{counter2}</h2>
            <Button onClick={changeC2}>change counter 2</Button>

            <h2>{isCounter2Even ? 'even' : 'odd'}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notification;
