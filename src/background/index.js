import browser from 'webextension-polyfill';
import { getFiltersMeta } from './filters';

let settings = {
    allowAcceptableAds: { id: 'allowAcceptableAds', value: true },
    showPageStatistic: { id: 'showPageStatistic', value: true },
    filtersAutodetect: { id: 'filtersAutodetect', value: true },
    filtersUpdatePeriod: { id: 'filtersUpdatePeriod', value: 3600 },
    safebrowsingEnabled: { id: 'safebrowsingEnabled', value: true },
    sendSafebrowsingStats: { id: 'sendSafebrowsingStats', value: true },
    useOptimizedFilters: { id: 'useOptimizedFilters', value: false },
    integrationModeCheckbox: { id: 'integrationModeCheckbox', value: true },
    enableHitsCount: { id: 'enableHitsCount', value: false },
    enableShowContextMenu: { id: 'enableShowContextMenu', value: true },
    showInfoAboutAdguardFullVersion: { id: 'showInfoAboutAdguardFullVersion', value: true },
    showAppUpdatedNotification: { id: 'showAppUpdatedNotification', value: true },
    stealthMode: { id: 'stealthMode', value: false },
    thirdPartyCookies: { id: 'thirdPartyCookies', value: true },
    thirdPartyTime: { id: 'thirdPartyTime', value: 2880 },
    firstPartyCookies: { id: 'firstPartyCookies', value: false },
    firstPartyTime: { id: 'firstPartyTime', value: 4320 },
    hideReferrer: { id: 'hideReferrer', value: true },
    hideSearchQueries: { id: 'hideSearchQueries', value: true },
    sendNotTrack: { id: 'sendNotTrack', value: true },
    removeClientData: { id: 'removeClientData', value: true },
    blockWebrtc: { id: 'blockWebrtc', value: false },
    stripTrackingParams: { id: 'stripTrackingParams', value: true },
    invertWhitelist: { id: 'invertWhitelist', value: false },
};

const APP_VERSION = '3.2.2';

const getSettingsByIds = ids => ids.reduce((acc, id) => ({ ...acc, [id]: settings[id] }), {});

// eslint-disable-next-line no-unused-vars
const messageHandler = async (request, sender, sendResponse) => new Promise(async (resolve, reject) => {
    const FILTERS_DATA = await getFiltersMeta();
    console.log(FILTERS_DATA);

    setTimeout(async () => {
        const { type } = request;
        switch (type) {
            case 'getVersion': {
                resolve(APP_VERSION);
                break;
            }
            case 'getFiltersData': {
                resolve(FILTERS_DATA);
                break;
            }
            case 'getSettingsByIds': {
                const { settingsIds } = request;
                resolve(getSettingsByIds(settingsIds));
                break;
            }
            case 'updateGroupStatus': {
                const { id, value } = request;
                // TODO do not update if value is the same
                const group = FILTERS_DATA.groups[id];
                if (!group) {
                    reject(new Error(`There is no group with id: ${id}`));
                }
                FILTERS_DATA.groups[id] = { ...group, enabled: value };
                console.log(`Group with id: "${id}" enabled property was set to: ${value}`);
                resolve(true);
                break;
            }
            case 'updateFilterStatus': {
                const { id, value } = request;
                // TODO do not update if value is the same
                const filter = FILTERS_DATA.filters[id];
                if (!filter) {
                    reject(new Error(`There is no filter with id: ${id}`));
                }
                FILTERS_DATA.filters[id] = { ...filter, enabled: value };
                console.log(`Filter with id: "${id}" enabled property was set to: ${value}`);
                resolve(true);
                break;
            }
            case 'updateSetting': {
                const { id, value } = request;
                const setting = settings[id];
                if (setting) {
                    const updatedSetting = { ...setting, value };
                    settings = { ...settings, [setting.id]: updatedSetting };
                    console.log(`Setting ${id} was set to ${value}`);
                    resolve(true);
                } else {
                    reject(new Error(`there is no such setting ${id}`));
                }
                break;
            }
            case 'checkCustomUrl': {
                const { url } = request;
                if (url.match('error')) {
                    reject(new Error('Url is not correct'));
                } else {
                    resolve({
                        title: 'AdGuard Base filter',
                        description: 'EasyList + AdGuard English filter. This filter is necessary for quality ad blocking.',
                        version: '2.0.64.6',
                        rulesCount: '95007',
                        homepage: 'http://adguard.com/filters.html#english',
                        url: 'https://filters.adtidy.org/extension/chromium/filters/2.txt',
                    });
                }
                break;
            }
            case 'addCustomFilter': {
                const { filterToAdd } = request;
                console.log(filterToAdd);
                // TODO implement filter add
                resolve();
                break;
            }
            default:
                break;
        }
    }, 500);
});

browser.runtime.onMessage.addListener(messageHandler);