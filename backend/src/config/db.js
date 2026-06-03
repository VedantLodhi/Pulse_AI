import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
    try {
        // Fallback for Node.js SRV resolution issue on Windows (uses local loopback which fails SRV queries)
        const servers = dns.getServers();
        if (servers.length === 0 || servers.every(s => s === "127.0.0.1" || s === "::1" || s === "localhost")) {
            dns.setServers(["1.1.1.1", "8.8.8.8"]);
        }

        // Use your MongoDB URI (local or Atlas)
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
