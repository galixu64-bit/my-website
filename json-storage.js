const JSON_STORAGE_CONFIG = {
    binId: null,
    apiKey: null,
    endpoint: 'https://api.jsonbin.io/v3/b'
};

async function saveResourcesToJSONBin(resources) {
    if (!JSON_STORAGE_CONFIG.binId || !JSON_STORAGE_CONFIG.apiKey) {
        console.warn('JSON存储未配置，跳过在线保存');
        return { success: false, error: '未配置JSON存储' };
    }

    try {
        const url = `${JSON_STORAGE_CONFIG.endpoint}/${JSON_STORAGE_CONFIG.binId}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSON_STORAGE_CONFIG.apiKey,
                'X-Bin-Versioning': 'false'
            },
            body: JSON.stringify(resources)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ 资源已保存到在线JSON库:', result);
            return { success: true, data: result };
        } else {
            const error = await response.text();
            console.error('❌ 保存到JSON库失败:', response.status, error);
            return { success: false, error: `HTTP ${response.status}: ${error}` };
        }
    } catch (error) {
        console.error('❌ 保存到JSON库时出错:', error);
        return { success: false, error: error.message };
    }
}

async function loadResourcesFromJSONBin() {
    if (!JSON_STORAGE_CONFIG.binId || !JSON_STORAGE_CONFIG.apiKey) {
        console.warn('JSON存储未配置，跳过在线加载');
        return { success: false, error: '未配置JSON存储' };
    }

    try {
        const url = `${JSON_STORAGE_CONFIG.endpoint}/${JSON_STORAGE_CONFIG.binId}/latest`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSON_STORAGE_CONFIG.apiKey
            }
        });

        if (response.ok) {
            const result = await response.json();
            const resources = result.record || [];
            console.log('✅ 从在线JSON库加载资源:', resources.length, '个');
            return { success: true, data: resources };
        } else {
            const error = await response.text();
            console.error('❌ 从JSON库加载失败:', response.status, error);
            return { success: false, error: `HTTP ${response.status}: ${error}` };
        }
    } catch (error) {
        console.error('❌ 从JSON库加载时出错:', error);
        return { success: false, error: error.message };
    }
}

async function createNewJSONBin(resources) {
    if (!JSON_STORAGE_CONFIG.apiKey) {
        console.warn('JSON存储API Key未配置');
        return { success: false, error: '未配置API Key' };
    }

    try {
        const url = `${JSON_STORAGE_CONFIG.endpoint}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSON_STORAGE_CONFIG.apiKey,
                'X-Bin-Name': 'resources-database',
                'X-Bin-Private': 'false'
            },
            body: JSON.stringify(resources)
        });

        if (response.ok) {
            const result = await response.json();
            const binId = result.metadata?.id;
            console.log('✅ 创建新的JSON库成功，Bin ID:', binId);
            return { success: true, binId: binId, data: result };
        } else {
            const error = await response.text();
            console.error('❌ 创建JSON库失败:', response.status, error);
            return { success: false, error: `HTTP ${response.status}: ${error}` };
        }
    } catch (error) {
        console.error('❌ 创建JSON库时出错:', error);
        return { success: false, error: error.message };
    }
}

function setJSONStorageConfig(binId, apiKey) {
    JSON_STORAGE_CONFIG.binId = binId;
    JSON_STORAGE_CONFIG.apiKey = apiKey;
    
    if (binId && apiKey) {
        localStorage.setItem('jsonStorageConfig', JSON.stringify({ binId, apiKey }));
        console.log('✅ JSON存储配置已保存');
    }
}

function loadJSONStorageConfig() {
    try {
        const saved = localStorage.getItem('jsonStorageConfig');
        if (saved) {
            const config = JSON.parse(saved);
            JSON_STORAGE_CONFIG.binId = config.binId;
            JSON_STORAGE_CONFIG.apiKey = config.apiKey;
            console.log('✅ JSON存储配置已加载');
            return config;
        }
    } catch (error) {
        console.error('加载JSON存储配置失败:', error);
    }
    return null;
}

if (typeof window !== 'undefined') {
    window.jsonStorage = {
        save: saveResourcesToJSONBin,
        load: loadResourcesFromJSONBin,
        create: createNewJSONBin,
        setConfig: setJSONStorageConfig,
        loadConfig: loadJSONStorageConfig,
        config: JSON_STORAGE_CONFIG
    };
    
    loadJSONStorageConfig();
}

