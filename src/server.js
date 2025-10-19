const app = require('./app');
const sequelize = require('./utils/connection');

const PORT = process.env.PORT || 4000;

const main = async() => {
    try{
        await sequelize.sync();
        console.log("✅ DB sincronizada!");
        
        app.listen(PORT);
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🚀 Server running on port http://localhost:${PORT}`);
    } catch(error){
        console.log("❌ Error:", error);
    }
}

main();