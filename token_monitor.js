const { ethers } = require("ethers");
require('dotenv').config();
const axios = require('axios');

const ABSTRACT_RPC_URL = process.env.ABSTRACT_RPC_URL;
const ABSTRACT_CONTRACT_DEPLOYER = process.env.ABSTRACT_CONTRACT_DEPLOYER;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

const provider = new ethers.JsonRpcProvider(ABSTRACT_RPC_URL);
const MIN_ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function decimals() view returns (uint8)"
];

async function getTransactionSafely(txHash) {
    try {
        return await provider.getTransaction(txHash);
    } catch (error) {
        if (error.code === 'INVALID_ARGUMENT' && error.argument === 'signature') {
            // Para transacciones que fallan por error de firma, obtenemos los datos mínimos que necesitamos
            // usando directamente el RPC para obtener la información básica
            const txData = await provider.send('eth_getTransactionByHash', [txHash]);
            return {
                hash: txData.hash,
                to: txData.to,
                data: txData.input,
                // Añadir otros campos si son necesarios para el procesamiento
            };
        }
        throw error; // Re-lanzar otros tipos de errores
    }
}

async function getTokenInfo(tokenAddress) {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, MIN_ERC20_ABI, provider);
        
        // Obtenemos la información básica del token
        let name, symbol, totalSupply, decimals;
        
        try {
            name = await tokenContract.name();
        } catch (error) {
            console.error(`Error al obtener el nombre del token ${tokenAddress}:`, error.message);
            name = "Nombre no disponible";
        }
        
        try {
            symbol = await tokenContract.symbol();
        } catch (error) {
            console.error(`Error al obtener el símbolo del token ${tokenAddress}:`, error.message);
            symbol = "???";
        }
        
        try {
            decimals = await tokenContract.decimals();
        } catch (error) {
            console.error(`Error al obtener los decimales del token ${tokenAddress}:`, error.message);
            decimals = 18; // Valor por defecto para la mayoría de los tokens
        }
        
        try {
            const rawSupply = await tokenContract.totalSupply();
            totalSupply = ethers.formatUnits(rawSupply, decimals);
        } catch (error) {
            console.error(`Error al obtener el supply del token ${tokenAddress}:`, error.message);
            totalSupply = "Supply no disponible";
        }
        
        return {
            address: tokenAddress,
            name,
            symbol,
            totalSupply,
            decimals
        };
    } catch (error) {
        console.error(`Error al obtener información del token ${tokenAddress}:`, error);
        return {
            address: tokenAddress,
            name: "Error al obtener información",
            symbol: "ERROR",
            totalSupply: "N/A",
            decimals: 0
        };
    }
}

async function sendTelegramMessage(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
        console.log("Configuración de Telegram no disponible, no se enviará mensaje");
        console.log("Mensaje que se habría enviado:", message);
        return;
    }
    
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: TELEGRAM_CHANNEL_ID,
            text: message,
            parse_mode: 'HTML'
        });
        console.log("Mensaje enviado a Telegram con éxito");
    } catch (error) {
        console.error("Error al enviar mensaje a Telegram:", error.message);
    }
}

async function startBlockMonitoring() {
    console.log("Iniciando monitoreo de bloques...");
    
    // Usamos polling para verificar cada bloque
    provider.on("block", async (blockNumber) => {
        try {
            const block = await provider.getBlock(blockNumber);
            if (!block) {
                console.log(`No se pudo obtener el bloque ${blockNumber}`);
                return;
            }
            // Obtenemos las transacciones una por una
            for (const txHash of block.transactions) {
                try {
                    // Obtener los detalles completos de la transacción usando nuestra función segura
                   //console.log('Obteniendo transacción...', txHash);
                    const tx = await getTransactionSafely(txHash);
                    
                    if (!tx) {
                        console.log(`No se pudo obtener transacción ${txHash}`);
                        continue;
                    }
                    const txTo = tx.to ? tx.to.toLowerCase() : null;
                    if (txTo && txTo === ABSTRACT_CONTRACT_DEPLOYER.toLowerCase() && tx.data && tx.data.startsWith('0x9c4d535b')) {
                        console.log(`Encontrada transacción relevante en bloque ${blockNumber}: ${tx.hash}`);
                        
                        try {
                            const receipt = await provider.getTransactionReceipt(tx.hash);
                            
                            if (!receipt || !receipt.logs) {
                                console.log(`No se pudo obtener receipt para tx ${tx.hash}`);
                                continue;
                            }
                            const logAddresses = [...new Set(receipt.logs.map(l => l.address.toLowerCase()))];
                            const mainTo = txTo;
                            const extraAddresses = logAddresses.filter(addr => addr !== mainTo);
                            
                            if (extraAddresses.length > 0) {
                                const createdAddress = extraAddresses[0];
                                console.log(`Dirección token creado: ${createdAddress}`);
                                
                                // Obtener información del token
                                const tokenInfo = await getTokenInfo(createdAddress);
                                
                                // Crear y enviar el mensaje a Telegram
                                const message = `🔥 <b>Nuevo Token Detectado en Abstract</b> 🔥\n\n` +
                                    `<b>Contrato:</b> ${tokenInfo.address}\n` +
                                    `<b>Nombre:</b> ${tokenInfo.name}\n` +
                                    `<b>Símbolo:</b> ${tokenInfo.symbol}\n` +
                                    `<b>Supply Total:</b> ${tokenInfo.totalSupply}\n\n` +
                                    `<b>TX:</b> <a href="https://abscan.org/tx/${tx.hash}">Ver Transacción</a>`;
                                console.log(message);
                                await sendTelegramMessage(message);
                            }
                        } catch (receiptError) {
                            console.error(`Error al procesar receipt de tx ${tx.hash}:`, receiptError);
                        }
                    }
                } catch (txError) {
                    console.error(`Error al procesar tx ${txHash}:`, txError.message);
                }
            }
        } catch (error) {
            console.error(`Error en el bloque ${blockNumber}:`, error);
        }
    });
}

console.log("Monitoreando nuevos tokens en Abstract...");
startBlockMonitoring();