import { sleep } from './sleep.js';
import { random } from './random.js';
import { Person } from './person.js';
const delay = random(100, 999);
const person = new Person('Diyorbek Musulmonov', 2006);
console.log(`wait ${delay} milisecond`);
await sleep(delay);
console.log(person.getInfo());