require('dotenv').config(); // تحميل .env
const { createClient } = require('redis');

async function main() {
    const client = createClient({
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT, 10)
        }
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    await client.connect();

    // تجربة تخزين واسترجاع
    await client.set('foo', 'bar');
    const result = await client.get('foo');
    console.log('Redis value:', result);  // >>> bar

    await client.quit();
}

main();
