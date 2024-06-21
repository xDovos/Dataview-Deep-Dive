'use strict';

var obsidian = require('obsidian');
var electron = require('electron');

var PathDisplayFormat;
(function (PathDisplayFormat) {
    PathDisplayFormat[PathDisplayFormat["None"] = 0] = "None";
    PathDisplayFormat[PathDisplayFormat["Full"] = 1] = "Full";
    PathDisplayFormat[PathDisplayFormat["FolderOnly"] = 2] = "FolderOnly";
    PathDisplayFormat[PathDisplayFormat["FolderWithFilename"] = 3] = "FolderWithFilename";
    PathDisplayFormat[PathDisplayFormat["FolderPathFilenameOptional"] = 4] = "FolderPathFilenameOptional";
})(PathDisplayFormat || (PathDisplayFormat = {}));
var Mode;
(function (Mode) {
    Mode[Mode["Standard"] = 1] = "Standard";
    Mode[Mode["EditorList"] = 2] = "EditorList";
    Mode[Mode["SymbolList"] = 4] = "SymbolList";
    Mode[Mode["WorkspaceList"] = 8] = "WorkspaceList";
    Mode[Mode["HeadingsList"] = 16] = "HeadingsList";
    Mode[Mode["BookmarksList"] = 32] = "BookmarksList";
    Mode[Mode["CommandList"] = 64] = "CommandList";
    Mode[Mode["RelatedItemsList"] = 128] = "RelatedItemsList";
    Mode[Mode["VaultList"] = 256] = "VaultList";
})(Mode || (Mode = {}));
var SymbolType;
(function (SymbolType) {
    SymbolType[SymbolType["Link"] = 1] = "Link";
    SymbolType[SymbolType["Embed"] = 2] = "Embed";
    SymbolType[SymbolType["Tag"] = 4] = "Tag";
    SymbolType[SymbolType["Heading"] = 8] = "Heading";
    SymbolType[SymbolType["Callout"] = 16] = "Callout";
    SymbolType[SymbolType["CanvasNode"] = 32] = "CanvasNode";
})(SymbolType || (SymbolType = {}));
var LinkType;
(function (LinkType) {
    LinkType[LinkType["None"] = 0] = "None";
    LinkType[LinkType["Normal"] = 1] = "Normal";
    LinkType[LinkType["Heading"] = 2] = "Heading";
    LinkType[LinkType["Block"] = 4] = "Block";
})(LinkType || (LinkType = {}));
const SymbolIndicators = {};
SymbolIndicators[SymbolType.Link] = '🔗';
SymbolIndicators[SymbolType.Embed] = '!';
SymbolIndicators[SymbolType.Tag] = '#';
SymbolIndicators[SymbolType.Heading] = 'H';
const HeadingIndicators = {};
HeadingIndicators[1] = 'H₁';
HeadingIndicators[2] = 'H₂';
HeadingIndicators[3] = 'H₃';
HeadingIndicators[4] = 'H₄';
HeadingIndicators[5] = 'H₅';
HeadingIndicators[6] = 'H₆';
var SuggestionType;
(function (SuggestionType) {
    SuggestionType["EditorList"] = "editorList";
    SuggestionType["SymbolList"] = "symbolList";
    SuggestionType["WorkspaceList"] = "workspaceList";
    SuggestionType["HeadingsList"] = "headingsList";
    SuggestionType["Bookmark"] = "bookmark";
    SuggestionType["CommandList"] = "commandList";
    SuggestionType["RelatedItemsList"] = "relatedItemsList";
    SuggestionType["VaultList"] = "vaultList";
    SuggestionType["File"] = "file";
    SuggestionType["Alias"] = "alias";
    SuggestionType["Unresolved"] = "unresolved";
})(SuggestionType || (SuggestionType = {}));
var MatchType;
(function (MatchType) {
    MatchType[MatchType["None"] = 0] = "None";
    MatchType[MatchType["Primary"] = 1] = "Primary";
    MatchType[MatchType["Basename"] = 2] = "Basename";
    MatchType[MatchType["Path"] = 3] = "Path";
})(MatchType || (MatchType = {}));
var RelationType;
(function (RelationType) {
    RelationType["DiskLocation"] = "disk-location";
    RelationType["Backlink"] = "backlink";
    RelationType["OutgoingLink"] = "outgoing-link";
})(RelationType || (RelationType = {}));

function isOfType(obj, discriminator, val) {
    let ret = false;
    if (obj && obj[discriminator] !== undefined) {
        ret = true;
        if (val !== undefined && val !== obj[discriminator]) {
            ret = false;
        }
    }
    return ret;
}
function isSymbolSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.SymbolList);
}
function isEditorSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.EditorList);
}
function isHeadingSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.HeadingsList);
}
function isFileSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.File);
}
function isAliasSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.Alias);
}
function isUnresolvedSuggestion(obj) {
    return isOfType(obj, 'type', SuggestionType.Unresolved);
}
function isSystemSuggestion(obj) {
    return isFileSuggestion(obj) || isUnresolvedSuggestion(obj) || isAliasSuggestion(obj);
}
function isExSuggestion(sugg) {
    return sugg && !isSystemSuggestion(sugg);
}
function isHeadingCache(obj) {
    return isOfType(obj, 'level');
}
function isTagCache(obj) {
    return isOfType(obj, 'tag');
}
function isCalloutCache(obj) {
    return isOfType(obj, 'type', 'callout');
}
function isTFile(obj) {
    return isOfType(obj, 'extension');
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getInternalPluginById(app, id) {
    return app?.internalPlugins?.getPluginById(id);
}
function getInternalEnabledPluginById(app, id) {
    return app?.internalPlugins?.getEnabledPluginById(id);
}
function getSystemSwitcherInstance(app) {
    const plugin = getInternalPluginById(app, 'switcher');
    return plugin?.instance;
}
/**
 * @returns Array The string names for all the available Modes.
 */
function getModeNames() {
    return Object.values(Mode)
        .filter((v) => isNaN(Number(v)))
        .sort();
}
function stripMDExtensionFromPath(file) {
    let retVal = null;
    if (file) {
        const { path } = file;
        retVal = path;
        if (file.extension === 'md') {
            const index = path.lastIndexOf('.');
            if (index !== -1 && index !== path.length - 1 && index !== 0) {
                retVal = path.slice(0, index);
            }
        }
    }
    return retVal;
}
function filenameFromPath(path) {
    let retVal = null;
    if (path) {
        const index = path.lastIndexOf('/');
        retVal = index === -1 ? path : path.slice(index + 1);
    }
    return retVal;
}
function matcherFnForRegExList(regExStrings) {
    regExStrings = regExStrings ?? [];
    const regExList = [];
    for (const str of regExStrings) {
        try {
            const rx = new RegExp(str);
            regExList.push(rx);
        }
        catch (err) {
            console.log(`Switcher++: error creating RegExp from string: ${str}`, err);
        }
    }
    const isMatchFn = (input) => {
        for (const rx of regExList) {
            if (rx.test(input)) {
                return true;
            }
        }
        return false;
    };
    return isMatchFn;
}
function getLinkType(linkCache) {
    let type = LinkType.None;
    if (linkCache) {
        // remove the display text before trying to parse the link target
        const linkStr = linkCache.link.split('|')[0];
        if (linkStr.includes('#^')) {
            type = LinkType.Block;
        }
        else if (linkStr.includes('#')) {
            type = LinkType.Heading;
        }
        else {
            type = LinkType.Normal;
        }
    }
    return type;
}
/**
 * Retrieves a TFile object using path. Return null if path does not represent
 * a TFile object.
 * @param  {string} path
 * @param  {Vault} vault
 * @returns TFile
 */
function getTFileByPath(path, vault) {
    let file = null;
    const abstractItem = vault.getAbstractFileByPath(path);
    if (isTFile(abstractItem)) {
        file = abstractItem;
    }
    return file;
}
function generateMarkdownLink(fileManager, vault, sugg, sourcePath, options) {
    let linkStr = null;
    options = Object.assign({ useBasenameAsAlias: true, useHeadingAsAlias: true }, options);
    if (sugg) {
        let destFile = getDestinationFileForSuggestion(sugg);
        let alias = null;
        let subpath = null;
        switch (sugg.type) {
            case SuggestionType.Unresolved:
                linkStr = generateMarkdownLinkForUnresolved(sugg.linktext);
                break;
            case SuggestionType.Alias:
                alias = sugg.alias;
                break;
            case SuggestionType.Bookmark: {
                const { item } = sugg;
                if (item.type === 'file' && item.title) {
                    alias = item.title;
                }
                break;
            }
            case SuggestionType.HeadingsList: {
                const { heading } = sugg.item;
                ({ subpath, alias } = sanitizeStringForLinkSubpath(heading, options.useHeadingAsAlias));
                break;
            }
            case SuggestionType.SymbolList: {
                const { item: { symbol }, } = sugg;
                if (isHeadingCache(symbol)) {
                    ({ subpath, alias } = sanitizeStringForLinkSubpath(symbol.heading, options.useHeadingAsAlias));
                }
                else if (isOfType(symbol, 'link')) {
                    // Test if the link matches the external link format [text](url)
                    const isExternalLink = new RegExp(/^\[(.*?)\]\((.+?)\)/).test(symbol.original);
                    if (isExternalLink) {
                        linkStr = symbol.original;
                    }
                    else {
                        linkStr = generateMarkdownLinkForReferenceCache(fileManager, vault, sourcePath, symbol, destFile, options.useBasenameAsAlias);
                    }
                }
                else {
                    // Disable link generation for other symbol types by setting destFile to null
                    destFile = null;
                }
                break;
            }
            case SuggestionType.RelatedItemsList: {
                const { item } = sugg;
                if (item.unresolvedText) {
                    linkStr = generateMarkdownLinkForUnresolved(item.unresolvedText);
                }
                break;
            }
        }
        if (destFile && !linkStr) {
            // if an alias has be not identified use the filename as alias
            if (!alias && options.useBasenameAsAlias) {
                alias = destFile.basename;
            }
            linkStr = fileManager.generateMarkdownLink(destFile, sourcePath, subpath, alias);
        }
    }
    return linkStr;
}
function sanitizeStringForLinkSubpath(input, useInputAsAlias) {
    // May 2024: shamelessly borrowed from Obsidian
    const illegalLinkCharsRegex = /([:#|^\\\r\n]|%%|\[\[|]])/g;
    const sanitizedInput = input
        .replace(illegalLinkCharsRegex, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return {
        subpath: `#${sanitizedInput}`,
        alias: useInputAsAlias ? sanitizedInput : null,
    };
}
/**
 * Determines if sugg is a file-based suggestion, and if so, returns the associated
 * destination TFile. Otherwise returns null.
 * @param  {AnySuggestion} sugg
 * @returns TFile|null
 */
function getDestinationFileForSuggestion(sugg) {
    let destFile = null;
    const fileSuggTypes = [
        SuggestionType.Alias,
        SuggestionType.Bookmark,
        SuggestionType.HeadingsList,
        SuggestionType.SymbolList,
        SuggestionType.RelatedItemsList,
        SuggestionType.EditorList,
        SuggestionType.File,
    ];
    if (fileSuggTypes.includes(sugg.type)) {
        // for file based suggestions, get the destination file
        destFile = sugg.file;
    }
    return destFile;
}
function generateMarkdownLinkForUnresolved(path, displayText) {
    displayText = displayText?.length ? `|${displayText}` : '';
    return `[[${path}${displayText}]]`;
}
function generateMarkdownLinkForReferenceCache(fileManager, vault, sourcePath, refCache, refCacheSourceFile, useBasenameAsAlias) {
    const { link, displayText } = refCache;
    const { path, subpath } = obsidian.parseLinktext(link);
    let alias = displayText;
    let destFile = null;
    let linkStr = null;
    if (!path?.length) {
        // the path portion of the link is empty, meaning the destination path
        // is the file that contains the ReferenceCache
        destFile = refCacheSourceFile;
    }
    else {
        destFile = getTFileByPath(path, vault);
    }
    if (destFile) {
        if (!alias?.length && useBasenameAsAlias) {
            alias = destFile.basename;
        }
        linkStr = fileManager.generateMarkdownLink(destFile, sourcePath, subpath, alias);
    }
    else {
        linkStr = generateMarkdownLinkForUnresolved(path, alias);
    }
    return linkStr;
}

class FrontMatterParser {
    static getAliases(frontMatter) {
        let aliases = [];
        if (frontMatter) {
            aliases = FrontMatterParser.getValueForKey(frontMatter, /^alias(es)?$/i);
        }
        return aliases;
    }
    static getValueForKey(frontMatter, keyPattern) {
        const retVal = [];
        const fmKeys = Object.keys(frontMatter);
        const key = fmKeys.find((val) => keyPattern.test(val));
        if (key) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            let value = frontMatter[key];
            if (typeof value === 'string') {
                value = value.split(',');
            }
            if (Array.isArray(value)) {
                value.forEach((val) => {
                    if (typeof val === 'string') {
                        retVal.push(val.trim());
                    }
                });
            }
        }
        return retVal;
    }
}

// map Canvas node data types to facet id
const CANVAS_NODE_FACET_ID_MAP = {
    file: 'canvas-node-file',
    text: 'canvas-node-text',
    link: 'canvas-node-link',
    group: 'canvas-node-group',
};
const SYMBOL_MODE_FACETS = [
    {
        id: SymbolType[SymbolType.Heading],
        mode: Mode.SymbolList,
        label: 'headings',
        isActive: false,
        isAvailable: true,
    },
    {
        id: SymbolType[SymbolType.Tag],
        mode: Mode.SymbolList,
        label: 'tags',
        isActive: false,
        isAvailable: true,
    },
    {
        id: SymbolType[SymbolType.Callout],
        mode: Mode.SymbolList,
        label: 'callouts',
        isActive: false,
        isAvailable: true,
    },
    {
        id: SymbolType[SymbolType.Link],
        mode: Mode.SymbolList,
        label: 'links',
        isActive: false,
        isAvailable: true,
    },
    {
        id: SymbolType[SymbolType.Embed],
        mode: Mode.SymbolList,
        label: 'embeds',
        isActive: false,
        isAvailable: true,
    },
    {
        id: CANVAS_NODE_FACET_ID_MAP.file,
        mode: Mode.SymbolList,
        label: 'file cards',
        isActive: false,
        isAvailable: true,
    },
    {
        id: CANVAS_NODE_FACET_ID_MAP.text,
        mode: Mode.SymbolList,
        label: 'text cards',
        isActive: false,
        isAvailable: true,
    },
    {
        id: CANVAS_NODE_FACET_ID_MAP.link,
        mode: Mode.SymbolList,
        label: 'link cards',
        isActive: false,
        isAvailable: true,
    },
    {
        id: CANVAS_NODE_FACET_ID_MAP.group,
        mode: Mode.SymbolList,
        label: 'groups',
        isActive: false,
        isAvailable: true,
    },
];
const RELATED_ITEMS_MODE_FACETS = [
    {
        id: RelationType.Backlink,
        mode: Mode.RelatedItemsList,
        label: 'backlinks',
        isActive: false,
        isAvailable: true,
    },
    {
        id: RelationType.OutgoingLink,
        mode: Mode.RelatedItemsList,
        label: 'outgoing links',
        isActive: false,
        isAvailable: true,
    },
    {
        id: RelationType.DiskLocation,
        mode: Mode.RelatedItemsList,
        label: 'disk location',
        isActive: false,
        isAvailable: true,
    },
];
const BOOKMARKS_FACET_ID_MAP = {
    file: 'bookmarks-file',
    folder: 'bookmarks-folder',
    search: 'bookmarks-search',
    group: 'bookmarks-group',
};
const BOOKMARKS_MODE_FACETS = [
    {
        id: BOOKMARKS_FACET_ID_MAP.file,
        mode: Mode.BookmarksList,
        label: 'files',
        isActive: false,
        isAvailable: true,
    },
    {
        id: BOOKMARKS_FACET_ID_MAP.folder,
        mode: Mode.BookmarksList,
        label: 'folders',
        isActive: false,
        isAvailable: true,
    },
    {
        id: BOOKMARKS_FACET_ID_MAP.search,
        mode: Mode.BookmarksList,
        label: 'searches',
        isActive: false,
        isAvailable: true,
    },
];
var CommandListFacetIds;
(function (CommandListFacetIds) {
    CommandListFacetIds["Pinned"] = "pinnedCommands";
    CommandListFacetIds["Recent"] = "recentCommands";
})(CommandListFacetIds || (CommandListFacetIds = {}));
const COMMAND_MODE_FACETS = [
    {
        id: CommandListFacetIds.Pinned,
        mode: Mode.CommandList,
        label: 'pinned',
        isActive: false,
        isAvailable: true,
    },
    {
        id: CommandListFacetIds.Recent,
        mode: Mode.CommandList,
        label: 'recent',
        isActive: false,
        isAvailable: true,
    },
];
var HeadingsListFacetIds;
(function (HeadingsListFacetIds) {
    HeadingsListFacetIds["RecentFiles"] = "recentFilesSearch";
    HeadingsListFacetIds["Bookmarks"] = "bookmarksSearch";
    HeadingsListFacetIds["Filenames"] = "filenamesSearch";
    HeadingsListFacetIds["Headings"] = "headingsSearch";
    HeadingsListFacetIds["ExternalFiles"] = "externalFilesSearch";
})(HeadingsListFacetIds || (HeadingsListFacetIds = {}));
const HEADINGS_MODE_FACETS = [
    {
        id: HeadingsListFacetIds.RecentFiles,
        mode: Mode.HeadingsList,
        label: 'recent files',
        isActive: false,
        isAvailable: true,
    },
    {
        id: HeadingsListFacetIds.Bookmarks,
        mode: Mode.HeadingsList,
        label: 'bookmarks',
        isActive: false,
        isAvailable: true,
    },
    {
        id: HeadingsListFacetIds.Filenames,
        mode: Mode.HeadingsList,
        label: 'filenames',
        isActive: false,
        isAvailable: true,
    },
    {
        id: HeadingsListFacetIds.Headings,
        mode: Mode.HeadingsList,
        label: 'headings',
        isActive: false,
        isAvailable: true,
    },
    {
        id: HeadingsListFacetIds.ExternalFiles,
        mode: Mode.HeadingsList,
        label: 'external files',
        isActive: false,
        isAvailable: true,
    },
];
function getFacetMap() {
    const facetMap = {};
    const facetLists = [
        SYMBOL_MODE_FACETS,
        RELATED_ITEMS_MODE_FACETS,
        BOOKMARKS_MODE_FACETS,
        COMMAND_MODE_FACETS,
        HEADINGS_MODE_FACETS,
    ];
    facetLists.flat().reduce((facetMap, facet) => {
        facetMap[facet.id] = Object.assign({}, facet);
        return facetMap;
    }, facetMap);
    return facetMap;
}

// istanbul ignore next
const isObject = (obj) => {
    if (typeof obj === "object" && obj !== null) {
        if (typeof Object.getPrototypeOf === "function") {
            const prototype = Object.getPrototypeOf(obj);
            return prototype === Object.prototype || prototype === null;
        }
        return Object.prototype.toString.call(obj) === "[object Object]";
    }
    return false;
};
const merge = (...objects) => objects.reduce((result, current) => {
    if (Array.isArray(current)) {
        throw new TypeError("Arguments provided to ts-deepmerge must be objects, not arrays.");
    }
    Object.keys(current).forEach((key) => {
        if (["__proto__", "constructor", "prototype"].includes(key)) {
            return;
        }
        if (Array.isArray(result[key]) && Array.isArray(current[key])) {
            result[key] = merge.options.mergeArrays
                ? merge.options.uniqueArrayItems
                    ? Array.from(new Set(result[key].concat(current[key])))
                    : [...result[key], ...current[key]]
                : current[key];
        }
        else if (isObject(result[key]) && isObject(current[key])) {
            result[key] = merge(result[key], current[key]);
        }
        else {
            result[key] =
                current[key] === undefined
                    ? merge.options.allowUndefinedOverrides
                        ? current[key]
                        : result[key]
                    : current[key];
        }
    });
    return result;
}, {});
const defaultOptions = {
    allowUndefinedOverrides: true,
    mergeArrays: true,
    uniqueArrayItems: true,
};
merge.options = defaultOptions;
merge.withOptions = (options, ...objects) => {
    merge.options = Object.assign(Object.assign({}, defaultOptions), options);
    const result = merge(...objects);
    merge.options = defaultOptions;
    return result;
};

class SwitcherPlusSettings {
    static get defaults() {
        const enabledSymbolTypes = {};
        enabledSymbolTypes[SymbolType.Link] = true;
        enabledSymbolTypes[SymbolType.Embed] = true;
        enabledSymbolTypes[SymbolType.Tag] = true;
        enabledSymbolTypes[SymbolType.Heading] = true;
        enabledSymbolTypes[SymbolType.Callout] = true;
        return {
            version: '2.0.0',
            onOpenPreferNewTab: true,
            alwaysNewTabForSymbols: false,
            useActiveTabForSymbolsOnMobile: false,
            symbolsInLineOrder: true,
            editorListCommand: 'edt ',
            symbolListCommand: '@',
            symbolListActiveEditorCommand: '$ ',
            workspaceListCommand: '+',
            headingsListCommand: '#',
            bookmarksListCommand: "'",
            commandListCommand: '>',
            vaultListCommand: 'vault ',
            relatedItemsListCommand: '~',
            relatedItemsListActiveEditorCommand: '^ ',
            shouldSearchHeadings: true,
            strictHeadingsOnly: false,
            searchAllHeadings: true,
            headingsSearchDebounceMilli: 250,
            excludeViewTypes: ['empty'],
            referenceViews: ['backlink', 'localgraph', 'outgoing-link', 'outline'],
            limit: 50,
            includeSidePanelViewTypes: ['backlink', 'image', 'markdown', 'pdf'],
            enabledSymbolTypes,
            selectNearestHeading: true,
            excludeFolders: [],
            excludeLinkSubTypes: 0,
            excludeRelatedFolders: [''],
            excludeOpenRelatedFiles: false,
            excludeObsidianIgnoredFiles: false,
            shouldSearchFilenames: false,
            shouldSearchBookmarks: false,
            shouldSearchRecentFiles: true,
            pathDisplayFormat: PathDisplayFormat.FolderWithFilename,
            hidePathIfRoot: true,
            enabledRelatedItems: Object.values(RelationType),
            showOptionalIndicatorIcons: true,
            overrideStandardModeBehaviors: true,
            enabledRibbonCommands: [
                Mode[Mode.HeadingsList],
                Mode[Mode.SymbolList],
            ],
            fileExtAllowList: ['canvas'],
            matchPriorityAdjustments: {
                isEnabled: false,
                adjustments: {
                    isOpenInEditor: { value: 0, label: 'Open items' },
                    isBookmarked: { value: 0, label: 'Bookmarked items' },
                    isRecent: { value: 0, label: 'Recent items' },
                    isAttachment: { value: 0, label: 'Attachment file types' },
                    file: { value: 0, label: 'Filenames' },
                    alias: { value: 0, label: 'Aliases' },
                    unresolved: { value: 0, label: 'Unresolved filenames' },
                    h1: { value: 0, label: 'H₁ headings' },
                },
                fileExtAdjustments: {
                    canvas: { value: 0, label: 'Canvas files' },
                },
            },
            quickFilters: {
                resetKey: '0',
                keyList: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
                modifiers: ['Ctrl', 'Alt'],
                facetList: getFacetMap(),
                shouldResetActiveFacets: false,
                shouldShowFacetInstructions: true,
            },
            preserveCommandPaletteLastInput: false,
            preserveQuickSwitcherLastInput: false,
            shouldCloseModalOnBackspace: false,
            maxRecentFileSuggestionsOnInit: 25,
            orderEditorListByAccessTime: true,
            insertLinkInEditor: {
                isEnabled: true,
                keymap: {
                    modifiers: ['Mod'],
                    key: 'i',
                    purpose: 'insert in editor',
                },
                insertableEditorTypes: ['markdown'],
                useBasenameAsAlias: true,
                useHeadingAsAlias: true,
            },
            removeDefaultTabBinding: true,
            navigationKeys: {
                nextKeys: [
                    { modifiers: ['Ctrl'], key: 'n' },
                    { modifiers: ['Ctrl'], key: 'j' },
                ],
                prevKeys: [
                    { modifiers: ['Ctrl'], key: 'p' },
                    { modifiers: ['Ctrl'], key: 'k' },
                ],
            },
            preferredSourceForTitle: 'H1',
            closeWhenEmptyKeys: [{ modifiers: null, key: 'Backspace' }],
            escapeCmdChar: '!',
            mobileLauncher: {
                isEnabled: false,
                modeString: Mode[Mode.HeadingsList],
                iconName: '',
                coreLauncherButtonIconSelector: 'span.clickable-icon',
                coreLauncherButtonSelector: '.mobile-navbar-action:has(span.clickable-icon svg.svg-icon.lucide-plus-circle)',
            },
            allowCreateNewFileInModeNames: [
                Mode[Mode.Standard],
                Mode[Mode.HeadingsList],
            ],
        };
    }
    get version() {
        return this.data.version;
    }
    set version(value) {
        this.data.version = value;
    }
    get builtInSystemOptions() {
        return getSystemSwitcherInstance(this.plugin.app)?.options;
    }
    get showAllFileTypes() {
        // forward to core switcher settings
        return this.builtInSystemOptions?.showAllFileTypes;
    }
    get showAttachments() {
        // forward to core switcher settings
        return this.builtInSystemOptions?.showAttachments;
    }
    get showExistingOnly() {
        // forward to core switcher settings
        return this.builtInSystemOptions?.showExistingOnly;
    }
    get onOpenPreferNewTab() {
        return this.data.onOpenPreferNewTab;
    }
    set onOpenPreferNewTab(value) {
        this.data.onOpenPreferNewTab = value;
    }
    get alwaysNewTabForSymbols() {
        return this.data.alwaysNewTabForSymbols;
    }
    set alwaysNewTabForSymbols(value) {
        this.data.alwaysNewTabForSymbols = value;
    }
    get useActiveTabForSymbolsOnMobile() {
        return this.data.useActiveTabForSymbolsOnMobile;
    }
    set useActiveTabForSymbolsOnMobile(value) {
        this.data.useActiveTabForSymbolsOnMobile = value;
    }
    get symbolsInLineOrder() {
        return this.data.symbolsInLineOrder;
    }
    set symbolsInLineOrder(value) {
        this.data.symbolsInLineOrder = value;
    }
    get editorListPlaceholderText() {
        return SwitcherPlusSettings.defaults.editorListCommand;
    }
    get editorListCommand() {
        return this.data.editorListCommand;
    }
    set editorListCommand(value) {
        this.data.editorListCommand = value;
    }
    get symbolListPlaceholderText() {
        return SwitcherPlusSettings.defaults.symbolListCommand;
    }
    get symbolListCommand() {
        return this.data.symbolListCommand;
    }
    set symbolListCommand(value) {
        this.data.symbolListCommand = value;
    }
    get symbolListActiveEditorCommand() {
        return this.data.symbolListActiveEditorCommand;
    }
    set symbolListActiveEditorCommand(value) {
        this.data.symbolListActiveEditorCommand = value;
    }
    get workspaceListCommand() {
        return this.data.workspaceListCommand;
    }
    set workspaceListCommand(value) {
        this.data.workspaceListCommand = value;
    }
    get workspaceListPlaceholderText() {
        return SwitcherPlusSettings.defaults.workspaceListCommand;
    }
    get headingsListCommand() {
        return this.data.headingsListCommand;
    }
    set headingsListCommand(value) {
        this.data.headingsListCommand = value;
    }
    get headingsListPlaceholderText() {
        return SwitcherPlusSettings.defaults.headingsListCommand;
    }
    get bookmarksListCommand() {
        return this.data.bookmarksListCommand;
    }
    set bookmarksListCommand(value) {
        this.data.bookmarksListCommand = value;
    }
    get bookmarksListPlaceholderText() {
        return SwitcherPlusSettings.defaults.bookmarksListCommand;
    }
    get commandListCommand() {
        return this.data.commandListCommand;
    }
    set commandListCommand(value) {
        this.data.commandListCommand = value;
    }
    get commandListPlaceholderText() {
        return SwitcherPlusSettings.defaults.commandListCommand;
    }
    get vaultListCommand() {
        return this.data.vaultListCommand;
    }
    set vaultListCommand(value) {
        this.data.vaultListCommand = value;
    }
    get vaultListPlaceholderText() {
        return SwitcherPlusSettings.defaults.vaultListCommand;
    }
    get relatedItemsListCommand() {
        return this.data.relatedItemsListCommand;
    }
    set relatedItemsListCommand(value) {
        this.data.relatedItemsListCommand = value;
    }
    get relatedItemsListPlaceholderText() {
        return SwitcherPlusSettings.defaults.relatedItemsListCommand;
    }
    get relatedItemsListActiveEditorCommand() {
        return this.data.relatedItemsListActiveEditorCommand;
    }
    set relatedItemsListActiveEditorCommand(value) {
        this.data.relatedItemsListActiveEditorCommand = value;
    }
    get shouldSearchHeadings() {
        return this.data.shouldSearchHeadings;
    }
    set shouldSearchHeadings(value) {
        this.data.shouldSearchHeadings = value;
    }
    get strictHeadingsOnly() {
        return this.data.strictHeadingsOnly;
    }
    set strictHeadingsOnly(value) {
        this.data.strictHeadingsOnly = value;
    }
    get searchAllHeadings() {
        return this.data.searchAllHeadings;
    }
    set searchAllHeadings(value) {
        this.data.searchAllHeadings = value;
    }
    get headingsSearchDebounceMilli() {
        return this.data.headingsSearchDebounceMilli;
    }
    set headingsSearchDebounceMilli(value) {
        this.data.headingsSearchDebounceMilli = value;
    }
    get excludeViewTypes() {
        return this.data.excludeViewTypes;
    }
    set excludeViewTypes(value) {
        this.data.excludeViewTypes = value;
    }
    get referenceViews() {
        return this.data.referenceViews;
    }
    set referenceViews(value) {
        this.data.referenceViews = value;
    }
    get limit() {
        return this.data.limit;
    }
    set limit(value) {
        this.data.limit = value;
    }
    get includeSidePanelViewTypes() {
        return this.data.includeSidePanelViewTypes;
    }
    set includeSidePanelViewTypes(value) {
        // remove any duplicates before storing
        this.data.includeSidePanelViewTypes = [...new Set(value)];
    }
    get includeSidePanelViewTypesPlaceholder() {
        return SwitcherPlusSettings.defaults.includeSidePanelViewTypes.join('\n');
    }
    get selectNearestHeading() {
        return this.data.selectNearestHeading;
    }
    set selectNearestHeading(value) {
        this.data.selectNearestHeading = value;
    }
    get excludeFolders() {
        return this.data.excludeFolders;
    }
    set excludeFolders(value) {
        // remove any duplicates before storing
        this.data.excludeFolders = [...new Set(value)];
    }
    get excludeLinkSubTypes() {
        return this.data.excludeLinkSubTypes;
    }
    set excludeLinkSubTypes(value) {
        this.data.excludeLinkSubTypes = value;
    }
    get excludeRelatedFolders() {
        return this.data.excludeRelatedFolders;
    }
    set excludeRelatedFolders(value) {
        this.data.excludeRelatedFolders = [...new Set(value)];
    }
    get excludeOpenRelatedFiles() {
        return this.data.excludeOpenRelatedFiles;
    }
    set excludeOpenRelatedFiles(value) {
        this.data.excludeOpenRelatedFiles = value;
    }
    get excludeObsidianIgnoredFiles() {
        return this.data.excludeObsidianIgnoredFiles;
    }
    set excludeObsidianIgnoredFiles(value) {
        this.data.excludeObsidianIgnoredFiles = value;
    }
    get shouldSearchFilenames() {
        return this.data.shouldSearchFilenames;
    }
    set shouldSearchFilenames(value) {
        this.data.shouldSearchFilenames = value;
    }
    get shouldSearchBookmarks() {
        return this.data.shouldSearchBookmarks;
    }
    set shouldSearchBookmarks(value) {
        this.data.shouldSearchBookmarks = value;
    }
    get shouldSearchRecentFiles() {
        return this.data.shouldSearchRecentFiles;
    }
    set shouldSearchRecentFiles(value) {
        this.data.shouldSearchRecentFiles = value;
    }
    get pathDisplayFormat() {
        return this.data.pathDisplayFormat;
    }
    set pathDisplayFormat(value) {
        this.data.pathDisplayFormat = value;
    }
    get hidePathIfRoot() {
        return this.data.hidePathIfRoot;
    }
    set hidePathIfRoot(value) {
        this.data.hidePathIfRoot = value;
    }
    get enabledRelatedItems() {
        return this.data.enabledRelatedItems;
    }
    set enabledRelatedItems(value) {
        this.data.enabledRelatedItems = value;
    }
    get showOptionalIndicatorIcons() {
        return this.data.showOptionalIndicatorIcons;
    }
    set showOptionalIndicatorIcons(value) {
        this.data.showOptionalIndicatorIcons = value;
    }
    get overrideStandardModeBehaviors() {
        return this.data.overrideStandardModeBehaviors;
    }
    set overrideStandardModeBehaviors(value) {
        this.data.overrideStandardModeBehaviors = value;
    }
    get enabledRibbonCommands() {
        return this.data.enabledRibbonCommands;
    }
    set enabledRibbonCommands(value) {
        // remove any duplicates before storing
        this.data.enabledRibbonCommands = [...new Set(value)];
    }
    get fileExtAllowList() {
        return this.data.fileExtAllowList;
    }
    set fileExtAllowList(value) {
        this.data.fileExtAllowList = value;
    }
    get matchPriorityAdjustments() {
        return this.data.matchPriorityAdjustments;
    }
    set matchPriorityAdjustments(value) {
        this.data.matchPriorityAdjustments = value;
    }
    get quickFilters() {
        return this.data.quickFilters;
    }
    set quickFilters(value) {
        this.data.quickFilters = value;
    }
    get preserveCommandPaletteLastInput() {
        return this.data.preserveCommandPaletteLastInput;
    }
    set preserveCommandPaletteLastInput(value) {
        this.data.preserveCommandPaletteLastInput = value;
    }
    get preserveQuickSwitcherLastInput() {
        return this.data.preserveQuickSwitcherLastInput;
    }
    set preserveQuickSwitcherLastInput(value) {
        this.data.preserveQuickSwitcherLastInput = value;
    }
    get shouldCloseModalOnBackspace() {
        return this.data.shouldCloseModalOnBackspace;
    }
    set shouldCloseModalOnBackspace(value) {
        this.data.shouldCloseModalOnBackspace = value;
    }
    get maxRecentFileSuggestionsOnInit() {
        return this.data.maxRecentFileSuggestionsOnInit;
    }
    set maxRecentFileSuggestionsOnInit(value) {
        this.data.maxRecentFileSuggestionsOnInit = value;
    }
    get orderEditorListByAccessTime() {
        return this.data.orderEditorListByAccessTime;
    }
    set orderEditorListByAccessTime(value) {
        this.data.orderEditorListByAccessTime = value;
    }
    get insertLinkInEditor() {
        return this.data.insertLinkInEditor;
    }
    set insertLinkInEditor(value) {
        this.data.insertLinkInEditor = value;
    }
    get removeDefaultTabBinding() {
        return this.data.removeDefaultTabBinding;
    }
    set removeDefaultTabBinding(value) {
        this.data.removeDefaultTabBinding = value;
    }
    get navigationKeys() {
        return this.data.navigationKeys;
    }
    set navigationKeys(value) {
        this.data.navigationKeys = value;
    }
    get preferredSourceForTitle() {
        return this.data.preferredSourceForTitle;
    }
    set preferredSourceForTitle(value) {
        this.data.preferredSourceForTitle = value;
    }
    get closeWhenEmptyKeys() {
        return this.data.closeWhenEmptyKeys;
    }
    set closeWhenEmptyKeys(value) {
        this.data.closeWhenEmptyKeys = value;
    }
    get escapeCmdChar() {
        return this.data.escapeCmdChar;
    }
    set escapeCmdChar(value) {
        this.data.escapeCmdChar = value;
    }
    get mobileLauncher() {
        return this.data.mobileLauncher;
    }
    set mobileLauncher(value) {
        this.data.mobileLauncher = value;
    }
    get allowCreateNewFileInModeNames() {
        return this.data.allowCreateNewFileInModeNames;
    }
    set allowCreateNewFileInModeNames(value) {
        // remove any duplicates before storing
        this.data.allowCreateNewFileInModeNames = [...new Set(value)];
    }
    constructor(plugin) {
        this.plugin = plugin;
        this.data = SwitcherPlusSettings.defaults;
    }
    async updateDataAndLoadSettings() {
        await SwitcherPlusSettings.transformDataFile(this.plugin, SwitcherPlusSettings.defaults);
        return await this.loadSettings();
    }
    async loadSettings() {
        const copy = (savedData, defaultData, keys) => {
            const keysToMerge = ['matchPriorityAdjustments', 'quickFilters'];
            const deepMerge = (key) => {
                return merge.withOptions({ mergeArrays: false }, defaultData[key], savedData[key]);
            };
            for (const key of keys) {
                if (key in savedData) {
                    defaultData[key] = keysToMerge.includes(key)
                        ? deepMerge(key)
                        : savedData[key];
                }
            }
        };
        try {
            const savedData = (await this.plugin?.loadData());
            if (savedData) {
                const keys = Object.keys(SwitcherPlusSettings.defaults);
                copy(savedData, this.data, keys);
            }
        }
        catch (err) {
            console.log('Switcher++: error loading settings, using defaults. ', err);
        }
    }
    async saveSettings() {
        const { plugin, data } = this;
        await plugin?.saveData(data);
    }
    save() {
        this.saveSettings().catch((e) => {
            console.log('Switcher++: error saving changes to settings', e);
        });
    }
    isSymbolTypeEnabled(symbol) {
        const { enabledSymbolTypes } = this.data;
        let value = SwitcherPlusSettings.defaults.enabledSymbolTypes[symbol];
        if (Object.prototype.hasOwnProperty.call(enabledSymbolTypes, symbol)) {
            value = enabledSymbolTypes[symbol];
        }
        return value;
    }
    setSymbolTypeEnabled(symbol, isEnabled) {
        this.data.enabledSymbolTypes[symbol] = isEnabled;
    }
    static async transformDataFile(plugin, defaults) {
        await SwitcherPlusSettings.transformDataFileToV1(plugin, defaults);
        await SwitcherPlusSettings.transformDataFileToV2(plugin, defaults);
    }
    static async transformDataFileToV1(plugin, defaults) {
        let isTransformed = false;
        try {
            const data = (await plugin?.loadData());
            if (data && typeof data === 'object') {
                const versionKey = 'version';
                if (!Object.prototype.hasOwnProperty.call(data, versionKey)) {
                    // rename from starred to bookmarks
                    const starredCommandKey = 'starredListCommand';
                    if (Object.prototype.hasOwnProperty.call(data, starredCommandKey)) {
                        data['bookmarksListCommand'] =
                            data[starredCommandKey] ?? defaults.bookmarksListCommand;
                        delete data[starredCommandKey];
                    }
                    // rename isStarred to isBookmarked
                    const isStarredKey = 'isStarred';
                    const adjustments = data['matchPriorityAdjustments'];
                    if (adjustments &&
                        Object.prototype.hasOwnProperty.call(adjustments, isStarredKey)) {
                        adjustments['isBookmarked'] = adjustments[isStarredKey];
                        delete adjustments[isStarredKey];
                    }
                    data[versionKey] = '1.0.0';
                    await plugin?.saveData(data);
                    isTransformed = true;
                }
            }
        }
        catch (error) {
            console.log('Switcher++: error transforming data.json to v1.0.0', error);
        }
        return isTransformed;
    }
    static async transformDataFileToV2(plugin, defaults) {
        let isTransformed = false;
        try {
            const data = (await plugin?.loadData());
            if (data && typeof data === 'object') {
                const versionKey = 'version';
                if (data[versionKey] === '1.0.0') {
                    const matchPriorityAdjustmentsKey = 'matchPriorityAdjustments';
                    if (Object.prototype.hasOwnProperty.call(data, matchPriorityAdjustmentsKey)) {
                        // Convert matchPriorityAdjustments to key/object pairs
                        // Version <= 1.0.0 type was Record<string, number>
                        const oldAdjustments = data[matchPriorityAdjustmentsKey];
                        const adjustments = {};
                        data[matchPriorityAdjustmentsKey] = {
                            isEnabled: !!data['enableMatchPriorityAdjustments'],
                            adjustments,
                        };
                        delete data['enableMatchPriorityAdjustments'];
                        Object.entries(oldAdjustments).forEach(([key, value]) => {
                            const label = defaults.matchPriorityAdjustments.adjustments[key]?.label ?? '';
                            adjustments[key] = { value, label };
                        });
                    }
                    const quickFiltersKey = 'quickFilters';
                    if (Object.prototype.hasOwnProperty.call(data, quickFiltersKey)) {
                        // convert .facetList from Array<Object> to Record<string, Object>
                        const facetListKey = 'facetList';
                        const quickFiltersData = data[quickFiltersKey];
                        const oldFacetList = quickFiltersData[facetListKey];
                        const facetList = oldFacetList?.reduce((facetMap, oldFacet) => {
                            const facetId = oldFacet['id'];
                            facetMap[facetId] = oldFacet;
                            return facetMap;
                        }, {});
                        quickFiltersData[facetListKey] = facetList;
                    }
                    data[versionKey] = '2.0.0';
                    await plugin?.saveData(data);
                    isTransformed = true;
                }
            }
        }
        catch (error) {
            console.log('Switcher++: error transforming data.json to v2.0.0', error);
        }
        return isTransformed;
    }
}

class SettingsTabSection {
    constructor(app, mainSettingsTab, config) {
        this.app = app;
        this.mainSettingsTab = mainSettingsTab;
        this.config = config;
    }
    /**
     * Creates a new Setting with the given name and description.
     * @param  {HTMLElement} containerEl
     * @param  {string} name
     * @param  {string} desc
     * @returns Setting
     */
    createSetting(containerEl, name, desc) {
        const setting = new obsidian.Setting(containerEl);
        setting.setName(name);
        setting.setDesc(desc);
        return setting;
    }
    /**
     * Create section title elements and divider.
     * @param  {HTMLElement} containerEl
     * @param  {string} title
     * @param  {string} desc?
     * @returns Setting
     */
    addSectionTitle(containerEl, title, desc = '') {
        const setting = this.createSetting(containerEl, title, desc);
        setting.setHeading();
        return setting;
    }
    /**
     * Creates a HTMLInput element setting.
     * @param  {HTMLElement} containerEl The element to attach the setting to.
     * @param  {string} name
     * @param  {string} desc
     * @param  {string} initialValue
     * @param  {StringTypedConfigKey} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored.
     * @param  {string} placeholderText?
     * @returns Setting
     */
    addTextSetting(containerEl, name, desc, initialValue, configStorageKey, placeholderText) {
        const setting = this.createSetting(containerEl, name, desc);
        setting.addText((comp) => {
            comp.setPlaceholder(placeholderText);
            comp.setValue(initialValue);
            comp.onChange((rawValue) => {
                const value = rawValue.length ? rawValue : initialValue;
                this.saveChangesToConfig(configStorageKey, value);
            });
        });
        return setting;
    }
    /**
     * Create a Checkbox element setting.
     * @param  {HTMLElement} containerEl The element to attach the setting to.
     * @param  {string} name
     * @param  {string} desc
     * @param  {boolean} initialValue
     * @param  {BooleanTypedConfigKey} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored. This can safely be set to null if the onChange handler is provided.
     * @param  {(value:string,config:SwitcherPlusSettings)=>void} onChange? optional callback to invoke instead of using configStorageKey
     * @returns Setting
     */
    addToggleSetting(containerEl, name, desc, initialValue, configStorageKey, onChange) {
        const setting = this.createSetting(containerEl, name, desc);
        setting.addToggle((comp) => {
            comp.setValue(initialValue);
            comp.onChange((value) => {
                if (onChange) {
                    onChange(value, this.config);
                }
                else {
                    this.saveChangesToConfig(configStorageKey, value);
                }
            });
        });
        return setting;
    }
    /**
     * Create a TextArea element setting.
     * @param  {HTMLElement} containerEl The element to attach the setting to.
     * @param  {string} name
     * @param  {string} desc
     * @param  {string} initialValue
     * @param  {ListTypedConfigKey|StringTypedConfigKey} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored.
     * @param  {string} placeholderText?
     * @returns Setting
     */
    addTextAreaSetting(containerEl, name, desc, initialValue, configStorageKey, placeholderText) {
        const setting = this.createSetting(containerEl, name, desc);
        setting.addTextArea((comp) => {
            comp.setPlaceholder(placeholderText);
            comp.setValue(initialValue);
            comp.onChange((rawValue) => {
                const value = rawValue.length ? rawValue : initialValue;
                const isArray = Array.isArray(this.config[configStorageKey]);
                this.saveChangesToConfig(configStorageKey, isArray ? value.split('\n') : value);
            });
        });
        return setting;
    }
    /**
     * Add a dropdown list setting
     * @param  {HTMLElement} containerEl
     * @param  {string} name
     * @param  {string} desc
     * @param  {string} initialValue option value that is initially selected
     * @param  {Record<string, string>} options
     * @param  {StringTypedConfigKey} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored. This can safely be set to null if the onChange handler is provided.
     * @param  {(rawValue:string,config:SwitcherPlusSettings)=>void} onChange? optional callback to invoke instead of using configStorageKey
     * @returns Setting
     */
    addDropdownSetting(containerEl, name, desc, initialValue, options, configStorageKey, onChange) {
        const setting = this.createSetting(containerEl, name, desc);
        setting.addDropdown((comp) => {
            comp.addOptions(options);
            comp.setValue(initialValue);
            comp.onChange((rawValue) => {
                if (onChange) {
                    onChange(rawValue, this.config);
                }
                else {
                    this.saveChangesToConfig(configStorageKey, rawValue);
                }
            });
        });
        return setting;
    }
    addSliderSetting(containerEl, name, desc, initialValue, limits, configStorageKey, onChange) {
        const setting = this.createSetting(containerEl, name, desc);
        // display a button to reset the slider value
        setting.addExtraButton((comp) => {
            comp.setIcon('lucide-rotate-ccw');
            comp.setTooltip('Restore default');
            comp.onClick(() => setting.components[1].setValue(0));
            return comp;
        });
        setting.addSlider((comp) => {
            comp.setLimits(limits[0], limits[1], limits[2]);
            comp.setValue(initialValue);
            comp.setDynamicTooltip();
            comp.onChange((value) => {
                if (onChange) {
                    onChange(value, this.config);
                }
                else {
                    this.saveChangesToConfig(configStorageKey, value);
                }
            });
        });
        return setting;
    }
    /**
     * Updates the internal SwitcherPlusSettings configStorageKey with value, and writes it to disk.
     * @param  {K} configStorageKey The SwitcherPlusSettings key where the value for this setting should be stored.
     * @param  {SwitcherPlusSettings[K]} value
     * @returns void
     */
    saveChangesToConfig(configStorageKey, value) {
        if (configStorageKey) {
            const { config } = this;
            config[configStorageKey] = value;
            config.save();
        }
    }
}

class BookmarksSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Bookmarks List Mode Settings');
        this.addTextSetting(containerEl, 'Bookmarks list mode trigger', 'Character that will trigger bookmarks list mode in the switcher', config.bookmarksListCommand, 'bookmarksListCommand', config.bookmarksListPlaceholderText);
    }
}

class CommandListSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Command List Mode Settings');
        this.addTextSetting(containerEl, 'Command list mode trigger', 'Character that will trigger command list mode in the switcher', config.commandListCommand, 'commandListCommand', config.commandListPlaceholderText);
    }
}

class RelatedItemsSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Related Items List Mode Settings');
        this.addTextSetting(containerEl, 'Related Items list mode trigger', 'Character that will trigger related items list mode in the switcher. This triggers a display of Related Items for the source file of the currently selected (highlighted) suggestion in the switcher. If there is not a suggestion, display results for the active editor.', config.relatedItemsListCommand, 'relatedItemsListCommand', config.relatedItemsListPlaceholderText);
        this.addTextSetting(containerEl, 'Related Items list mode trigger - Active editor only', 'Character that will trigger related items list mode in the switcher. This always triggers a display of Related Items for the active editor only.', config.relatedItemsListActiveEditorCommand, 'relatedItemsListActiveEditorCommand', config.relatedItemsListActiveEditorCommand);
        this.showEnabledRelatedItems(containerEl, config);
        this.addToggleSetting(containerEl, 'Exclude open files', 'Enable, related files which are already open will not be displayed in the list. Disabled, All related files will be displayed in the list.', config.excludeOpenRelatedFiles, 'excludeOpenRelatedFiles');
    }
    showEnabledRelatedItems(containerEl, config) {
        const relationTypes = Object.values(RelationType).sort();
        const relationTypesStr = relationTypes.join(', ');
        const desc = `The types of related items to show in the list. Add one type per line. Available types: ${relationTypesStr}`;
        this.createSetting(containerEl, 'Show related item types', desc).addTextArea((textArea) => {
            textArea.setValue(config.enabledRelatedItems.join('\n'));
            textArea.inputEl.addEventListener('focusout', () => {
                const values = textArea
                    .getValue()
                    .split('\n')
                    .map((v) => v.trim())
                    .filter((v) => v.length > 0);
                const invalidValues = [...new Set(values)].filter((v) => !relationTypes.includes(v));
                if (invalidValues?.length) {
                    this.showErrorPopup(invalidValues.join('<br/>'), relationTypesStr);
                }
                else {
                    config.enabledRelatedItems = values;
                    config.save();
                }
            });
        });
    }
    showErrorPopup(invalidTypes, relationTypes) {
        const popup = new obsidian.Modal(this.app);
        popup.titleEl.setText('Invalid related item type');
        popup.contentEl.innerHTML = `Changes not saved. Available relation types are: ${relationTypes}. The following types are invalid:<br/><br/>${invalidTypes}`;
        popup.open();
    }
}

class GeneralSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'General Settings');
        this.showEnabledRibbonCommands(containerEl, config);
        this.showOverrideMobileLauncher(containerEl, config);
        this.showPreferredSourceForTitle(containerEl, config);
        this.showPathDisplayFormat(containerEl, config);
        this.addToggleSetting(containerEl, 'Hide path for root items', 'When enabled, path information will be hidden for items at the root of the vault.', config.hidePathIfRoot, 'hidePathIfRoot').setClass('qsp-setting-item-indent');
        this.addTextSetting(containerEl, 'Mode trigger escape character', 'Character to indicate that a mode trigger character should be treated just as a normal text.', config.escapeCmdChar, 'escapeCmdChar');
        this.addToggleSetting(containerEl, 'Default to open in new tab', 'When enabled, navigating to un-opened files will open a new editor tab whenever possible (as if cmd/ctrl were held). When the file is already open, the existing tab will be activated. This overrides all other tab settings.', config.onOpenPreferNewTab, 'onOpenPreferNewTab');
        this.addToggleSetting(containerEl, 'Override Standard mode behavior', 'When enabled, Switcher++ will change the default Obsidian builtin Switcher functionality (Standard mode) to inject custom behavior.', config.overrideStandardModeBehaviors, 'overrideStandardModeBehaviors');
        this.addToggleSetting(containerEl, 'Show indicator icons', 'Display icons to indicate that an item is recent, bookmarked, etc..', config.showOptionalIndicatorIcons, 'showOptionalIndicatorIcons');
        this.addToggleSetting(containerEl, 'Allow Backspace key to close the Switcher', 'When the search box is empty, pressing the backspace key will close Switcher++.', config.shouldCloseModalOnBackspace, 'shouldCloseModalOnBackspace');
        this.showMatchPriorityAdjustments(containerEl, config);
        this.showInsertLinkInEditor(containerEl, config);
        this.addToggleSetting(containerEl, 'Restore previous input in Command Mode', 'When enabled, restore the last typed input in Command Mode when launched via global command hotkey.', config.preserveCommandPaletteLastInput, 'preserveCommandPaletteLastInput');
        this.addToggleSetting(containerEl, 'Restore previous input', 'When enabled, restore the last typed input when launched via global command hotkey.', config.preserveQuickSwitcherLastInput, 'preserveQuickSwitcherLastInput');
        this.showResetFacetEachSession(containerEl, config);
    }
    showPreferredSourceForTitle(containerEl, config) {
        const options = {
            H1: 'First H₁ heading',
            Default: 'Default',
        };
        this.addDropdownSetting(containerEl, 'Preferred suggestion title source', 'The preferred source to use for the "title" text that will be searched and displayed for file based suggestions', config.preferredSourceForTitle, options, 'preferredSourceForTitle');
    }
    showPathDisplayFormat(containerEl, config) {
        const options = {};
        options[PathDisplayFormat.None.toString()] = 'Hide path';
        options[PathDisplayFormat.Full.toString()] = 'Full path';
        options[PathDisplayFormat.FolderOnly.toString()] = 'Only parent folder';
        options[PathDisplayFormat.FolderWithFilename.toString()] = 'Parent folder & filename';
        options[PathDisplayFormat.FolderPathFilenameOptional.toString()] =
            'Parent folder path (filename optional)';
        this.addDropdownSetting(containerEl, 'Preferred file path display format', 'The preferred way to display file paths in suggestions', config.pathDisplayFormat.toString(), options, null, (rawValue, config) => {
            config.pathDisplayFormat = Number(rawValue);
            config.save();
        });
    }
    showEnabledRibbonCommands(containerEl, config) {
        const modeNames = Object.values(Mode)
            .filter((v) => isNaN(Number(v)))
            .sort();
        const modeNamesStr = modeNames.join(' ');
        const desc = `Display an icon in the ribbon menu to launch specific modes. Add one mode per line. Available modes: ${modeNamesStr}`;
        this.createSetting(containerEl, 'Show ribbon icons', desc).addTextArea((textArea) => {
            textArea.setValue(config.enabledRibbonCommands.join('\n'));
            textArea.inputEl.addEventListener('focusout', () => {
                const values = textArea
                    .getValue()
                    .split('\n')
                    .map((v) => v.trim())
                    .filter((v) => v.length > 0);
                const invalidValues = Array.from(new Set(values)).filter((v) => !modeNames.includes(v));
                if (invalidValues.length) {
                    this.showErrorPopup(invalidValues.join('<br/>'), modeNamesStr);
                }
                else {
                    config.enabledRibbonCommands = values;
                    config.save();
                    // force unregister/register of ribbon commands, so the changes take
                    // effect immediately
                    this.mainSettingsTab.plugin.registerRibbonCommandIcons();
                }
            });
        });
    }
    showErrorPopup(invalidValues, validModes) {
        const popup = new obsidian.Modal(this.app);
        popup.titleEl.setText('Invalid mode');
        popup.contentEl.innerHTML = `Changes not saved. Available modes are: ${validModes}. The following are invalid:<br/><br/>${invalidValues}`;
        popup.open();
    }
    showOverrideMobileLauncher(containerEl, config) {
        const { mobileLauncher } = config;
        const desc = 'Override the "⊕" button (in the Navigation Bar) on mobile platforms to launch Switcher++ instead of the default system switcher. Select the Mode to launch Switcher++ in, or select "Do not override" to disable the feature.';
        const disableOptionKey = 'disabled'; // Option to disable the feature
        const options = { [disableOptionKey]: 'Do not override' };
        // Add each mode to the list of options
        const modeNames = getModeNames();
        modeNames.forEach((name) => {
            options[name] = name;
        });
        let initialValue = disableOptionKey;
        if (mobileLauncher.isEnabled &&
            modeNames.includes(mobileLauncher.modeString)) {
            initialValue = mobileLauncher.modeString;
        }
        this.addDropdownSetting(containerEl, 'Override default Switcher launch button (the "⊕" button) on mobile platforms', desc, initialValue, options, null, (rawValue, config) => {
            const isEnabled = rawValue !== disableOptionKey;
            config.mobileLauncher.isEnabled = isEnabled;
            if (isEnabled) {
                config.mobileLauncher.modeString = rawValue;
            }
            config.save();
            this.mainSettingsTab.plugin.updateMobileLauncherButtonOverride(isEnabled);
        });
    }
    showMatchPriorityAdjustments(containerEl, config) {
        const { matchPriorityAdjustments: { isEnabled, adjustments, fileExtAdjustments }, } = config;
        this.addToggleSetting(containerEl, 'Result priority adjustments', 'Artificially increase the match score of the specified item types by a fixed percentage so they appear higher in the results list (does not apply to Standard Mode).', isEnabled, null, (isEnabled, config) => {
            config.matchPriorityAdjustments.isEnabled = isEnabled;
            // have to wait for the save here because the call to display() will
            // trigger a read of the updated data
            config.saveSettings().then(() => {
                // reload the settings panel. This will cause the matchPriorityAdjustments
                // controls to be shown/hidden based on isEnabled status
                this.mainSettingsTab.display();
            }, (reason) => console.log('Switcher++: error saving "Result Priority Adjustments" setting. ', reason));
        });
        if (isEnabled) {
            [adjustments, fileExtAdjustments].forEach((collection) => {
                Object.entries(collection).forEach(([key, data]) => {
                    const { value, label } = data;
                    const setting = this.addSliderSetting(containerEl, label, data.desc ?? '', value, [-1, 1, 0.05], null, (value, config) => {
                        collection[key].value = value;
                        config.save();
                    });
                    setting.setClass('qsp-setting-item-indent');
                });
            });
        }
    }
    showResetFacetEachSession(containerEl, config) {
        this.addToggleSetting(containerEl, 'Reset active Quick Filters', 'When enabled, the switcher will reset all Quick Filters back to inactive for each session.', config.quickFilters.shouldResetActiveFacets, null, (value, config) => {
            config.quickFilters.shouldResetActiveFacets = value;
            config.save();
        });
    }
    showInsertLinkInEditor(containerEl, config) {
        this.createSetting(containerEl, 'Insert link in editor', '');
        let setting = this.addToggleSetting(containerEl, 'Use filename as alias', 'When enabled, the file basename will be set as the link alias.', config.insertLinkInEditor.useBasenameAsAlias, null, (value, config) => {
            config.insertLinkInEditor.useBasenameAsAlias = value;
            config.save();
        });
        setting.setClass('qsp-setting-item-indent');
        setting = this.addToggleSetting(containerEl, 'Use heading as alias', 'When enabled, the file heading will be set as the link alias. This overrides the "use filename as alias" setting.', config.insertLinkInEditor.useHeadingAsAlias, null, (value, config) => {
            config.insertLinkInEditor.useHeadingAsAlias = value;
            config.save();
        });
        setting.setClass('qsp-setting-item-indent');
    }
}

class WorkspaceSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Workspace List Mode Settings');
        this.addTextSetting(containerEl, 'Workspace list mode trigger', 'Character that will trigger workspace list mode in the switcher', config.workspaceListCommand, 'workspaceListCommand', config.workspaceListPlaceholderText);
    }
}

class EditorSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Editor List Mode Settings');
        this.addTextSetting(containerEl, 'Editor list mode trigger', 'Character that will trigger editor list mode in the switcher', config.editorListCommand, 'editorListCommand', config.editorListPlaceholderText);
        this.showIncludeSidePanelViews(containerEl, config);
        this.addToggleSetting(containerEl, 'Order default editor list by most recently accessed', 'When there is no search term, order the list of editors by most recent access time.', config.orderEditorListByAccessTime, 'orderEditorListByAccessTime');
    }
    showIncludeSidePanelViews(containerEl, config) {
        const viewsListing = Object.keys(this.app.viewRegistry.viewByType).sort().join(' ');
        const desc = `When in Editor list mode, show the following view types from the side panels. Add one view type per line. Available view types: ${viewsListing}`;
        this.addTextAreaSetting(containerEl, 'Include side panel views', desc, config.includeSidePanelViewTypes.join('\n'), 'includeSidePanelViewTypes', config.includeSidePanelViewTypesPlaceholder);
    }
}

class HeadingsSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Headings List Mode Settings');
        this.addTextSetting(containerEl, 'Headings list mode trigger', 'Character that will trigger headings list mode in the switcher', config.headingsListCommand, 'headingsListCommand', config.headingsListPlaceholderText);
        this.showHeadingSettings(containerEl, config);
        this.addToggleSetting(containerEl, 'Search Filenames', "Enabled, search and show suggestions for filenames. Disabled, Don't search through filenames (except for fallback searches)", config.shouldSearchFilenames, 'shouldSearchFilenames');
        this.addToggleSetting(containerEl, 'Search Bookmarks', "Enabled, search and show suggestions for Bookmarks. Disabled, Don't search through Bookmarks", config.shouldSearchBookmarks, 'shouldSearchBookmarks');
        this.addSliderSetting(containerEl, 'Max recent files to show', 'The maximum number of recent files to show when there is no search term', config.maxRecentFileSuggestionsOnInit, [0, 75, 1], 'maxRecentFileSuggestionsOnInit');
        this.showExcludeFolders(containerEl, config);
        this.addToggleSetting(containerEl, 'Hide Obsidian "Excluded files"', 'Enabled, do not display suggestions for files that are in Obsidian\'s "Options > Files & Links > Excluded files" list. Disabled, suggestions for those files will be displayed but downranked.', config.excludeObsidianIgnoredFiles, 'excludeObsidianIgnoredFiles');
        this.showFileExtAllowList(containerEl, config);
    }
    showHeadingSettings(containerEl, config) {
        const isEnabled = config.shouldSearchHeadings;
        this.addToggleSetting(containerEl, 'Search Headings', "Enabled, search and show suggestions for Headings. Disabled, Don't search through Headings", isEnabled, null, (isEnabled, config) => {
            config.shouldSearchHeadings = isEnabled;
            // have to wait for the save here because the call to display() will
            // trigger a read of the updated data
            config.saveSettings().then(() => {
                // reload the settings panel. This will cause the other option
                // controls to be shown/hidden based on isEnabled status
                this.mainSettingsTab.display();
            }, (reason) => console.log('Switcher++: error saving "Search Headings" setting. ', reason));
        });
        if (isEnabled) {
            let setting = this.addToggleSetting(containerEl, 'Turn off filename fallback', 'Enabled, strictly search through only the headings contained in the file. Do not fallback to searching the filename when an H1 match is not found. Disabled, fallback to searching against the filename when there is not a match in the first H1 contained in the file.', config.strictHeadingsOnly, 'strictHeadingsOnly');
            setting.setClass('qsp-setting-item-indent');
            setting = this.addToggleSetting(containerEl, 'Search all headings', 'Enabled, search through all headings contained in each file. Disabled, only search through the first H1 in each file.', config.searchAllHeadings, 'searchAllHeadings');
            setting.setClass('qsp-setting-item-indent');
        }
    }
    showFileExtAllowList(containerEl, config) {
        this.createSetting(containerEl, 'File extension override', 'Override the "Show attachments" and the "Show all file types" builtin, system Switcher settings and always search files with the listed extensions. Add one path per line. For example to add ".canvas" file extension, just add "canvas".').addTextArea((textArea) => {
            textArea.setValue(config.fileExtAllowList.join('\n'));
            textArea.inputEl.addEventListener('focusout', () => {
                const allowList = textArea
                    .getValue()
                    .split('\n')
                    .map((v) => v.trim())
                    .filter((v) => v.length > 0);
                config.fileExtAllowList = allowList;
                config.save();
            });
        });
    }
    showExcludeFolders(containerEl, config) {
        const settingName = 'Exclude folders';
        this.createSetting(containerEl, settingName, 'When in Headings list mode, folder path that match any regex listed here will not be searched for suggestions. Path should start from the Vault Root. Add one path per line.').addTextArea((textArea) => {
            textArea.setValue(config.excludeFolders.join('\n'));
            textArea.inputEl.addEventListener('focusout', () => {
                const excludes = textArea
                    .getValue()
                    .split('\n')
                    .filter((v) => v.length > 0);
                if (this.validateExcludeFolderList(settingName, excludes)) {
                    config.excludeFolders = excludes;
                    config.save();
                }
            });
        });
    }
    validateExcludeFolderList(settingName, excludes) {
        let isValid = true;
        let failedMsg = '';
        for (const str of excludes) {
            try {
                new RegExp(str);
            }
            catch (err) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                failedMsg += `<span class="qsp-warning">${str}</span><br/>${err}<br/><br/>`;
                isValid = false;
            }
        }
        if (!isValid) {
            const popup = new obsidian.Modal(this.app);
            popup.titleEl.setText(settingName);
            popup.contentEl.innerHTML = `Changes not saved. The following regex contain errors:<br/><br/>${failedMsg}`;
            popup.open();
        }
        return isValid;
    }
}

class SymbolSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        this.addSectionTitle(containerEl, 'Symbol List Mode Settings');
        this.addTextSetting(containerEl, 'Symbol list mode trigger', 'Character that will trigger symbol list mode in the switcher. This triggers a display of Symbols for the source file of the currently selected (highlighted) suggestion in the switcher. If there is not a suggestion, display results for the active editor.', config.symbolListCommand, 'symbolListCommand', config.symbolListPlaceholderText);
        this.addTextSetting(containerEl, 'Symbol list mode trigger - Active editor only', 'Character that will trigger symbol list mode in the switcher. This always triggers a display of Symbols for the active editor only.', config.symbolListActiveEditorCommand, 'symbolListActiveEditorCommand', config.symbolListActiveEditorCommand);
        this.addToggleSetting(containerEl, 'List symbols as indented outline', 'Enabled, symbols will be displayed in the (line) order they appear in the source text, indented under any preceding heading. Disabled, symbols will be grouped by type: Headings, Tags, Links, Embeds.', config.symbolsInLineOrder, 'symbolsInLineOrder');
        this.addToggleSetting(containerEl, 'Open Symbols in new tab', 'Enabled, always open a new tab when navigating to Symbols. Disabled, navigate in an already open tab (if one exists).', config.alwaysNewTabForSymbols, 'alwaysNewTabForSymbols');
        this.addToggleSetting(containerEl, 'Open Symbols in active tab on mobile devices', 'Enabled, navigate to the target file and symbol in the active editor tab. Disabled, open a new tab when navigating to Symbols, even on mobile devices.', config.useActiveTabForSymbolsOnMobile, 'useActiveTabForSymbolsOnMobile');
        this.addToggleSetting(containerEl, 'Auto-select nearest heading', 'Enabled, in an unfiltered symbol list, select the closest preceding Heading to the current cursor position. Disabled, the first symbol in the list is selected.', config.selectNearestHeading, 'selectNearestHeading');
        this.showEnableSymbolTypesToggle(containerEl, config);
        this.showEnableLinksToggle(containerEl, config);
    }
    showEnableSymbolTypesToggle(containerEl, config) {
        const allowedSymbols = [
            ['Show Headings', SymbolType.Heading],
            ['Show Tags', SymbolType.Tag],
            ['Show Embeds', SymbolType.Embed],
            ['Show Callouts', SymbolType.Callout],
        ];
        allowedSymbols.forEach(([name, symbolType]) => {
            this.addToggleSetting(containerEl, name, '', config.isSymbolTypeEnabled(symbolType), null, (isEnabled) => {
                config.setSymbolTypeEnabled(symbolType, isEnabled);
                config.save();
            });
        });
    }
    showEnableLinksToggle(containerEl, config) {
        const isLinksEnabled = config.isSymbolTypeEnabled(SymbolType.Link);
        this.addToggleSetting(containerEl, 'Show Links', '', isLinksEnabled, null, (isEnabled) => {
            config.setSymbolTypeEnabled(SymbolType.Link, isEnabled);
            // have to wait for the save here because the call to display() will
            // trigger a read of the updated data
            config.saveSettings().then(() => {
                // reload the settings panel. This will cause the sublink types toggle
                // controls to be shown/hidden based on isLinksEnabled status
                this.mainSettingsTab.display();
            }, (reason) => console.log('Switcher++: error saving "Show Links" setting. ', reason));
        });
        if (isLinksEnabled) {
            const allowedLinkTypes = [
                ['Links to headings', LinkType.Heading],
                ['Links to blocks', LinkType.Block],
            ];
            allowedLinkTypes.forEach(([name, linkType]) => {
                const isExcluded = (config.excludeLinkSubTypes & linkType) === linkType;
                const setting = this.addToggleSetting(containerEl, name, '', !isExcluded, null, (isEnabled) => this.saveEnableSubLinkChange(linkType, isEnabled));
                setting.setClass('qsp-setting-item-indent');
            });
        }
    }
    saveEnableSubLinkChange(linkType, isEnabled) {
        const { config } = this;
        let exclusions = config.excludeLinkSubTypes;
        if (isEnabled) {
            // remove from exclusion list
            exclusions &= ~linkType;
        }
        else {
            // add to exclusion list
            exclusions |= linkType;
        }
        config.excludeLinkSubTypes = exclusions;
        config.save();
    }
}

class VaultListSettingsTabSection extends SettingsTabSection {
    display(containerEl) {
        const { config } = this;
        const titleSetting = this.addSectionTitle(containerEl, 'Vault List Mode Settings');
        titleSetting.nameEl?.createSpan({
            cls: ['qsp-tag', 'qsp-warning'],
            text: 'Experimental',
        });
        this.addTextSetting(containerEl, 'Vault list mode trigger', 'Character that will trigger vault list mode in the switcher', config.vaultListCommand, 'vaultListCommand', config.vaultListPlaceholderText);
    }
}

class SwitcherPlusSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin, config) {
        super(app, plugin);
        this.plugin = plugin;
        this.config = config;
    }
    display() {
        const { containerEl } = this;
        const tabSections = [
            GeneralSettingsTabSection,
            SymbolSettingsTabSection,
            HeadingsSettingsTabSection,
            EditorSettingsTabSection,
            RelatedItemsSettingsTabSection,
            BookmarksSettingsTabSection,
            CommandListSettingsTabSection,
            WorkspaceSettingsTabSection,
            VaultListSettingsTabSection,
        ];
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Quick Switcher++ Settings' });
        tabSections.forEach((tabSectionClass) => {
            this.displayTabSection(tabSectionClass);
        });
    }
    displayTabSection(tabSectionClass) {
        const { app, config, containerEl } = this;
        const tabSection = new tabSectionClass(app, this, config);
        tabSection.display(containerEl);
    }
}

class InputInfo {
    static get defaultParsedCommand() {
        return {
            isValidated: false,
            index: -1,
            parsedInput: null,
        };
    }
    get searchQuery() {
        return this._searchQuery;
    }
    get inputTextSansEscapeChar() {
        return this._inputTextSansEscapeChar ?? this.inputText;
    }
    set inputTextSansEscapeChar(value) {
        this._inputTextSansEscapeChar = value;
    }
    constructor(inputText = '', mode = Mode.Standard, sessionOpts) {
        this.inputText = inputText;
        this.mode = mode;
        this._inputTextSansEscapeChar = null;
        this.currentWorkspaceEnvList = {
            openWorkspaceLeaves: new Set(),
            openWorkspaceFiles: new Set(),
            fileBookmarks: new Map(),
            nonFileBookmarks: new Set(),
            mostRecentFiles: new Set(),
            attachmentFileExtensions: new Set(),
        };
        this.sessionOpts = sessionOpts ?? {};
        const symbolListCmd = {
            ...InputInfo.defaultParsedCommand,
            source: null,
        };
        const relatedItemsListCmd = {
            ...InputInfo.defaultParsedCommand,
            source: null,
        };
        const parsedCmds = {};
        this.parsedCommands = parsedCmds;
        parsedCmds[Mode.SymbolList] = symbolListCmd;
        parsedCmds[Mode.RelatedItemsList] = relatedItemsListCmd;
        [
            Mode.Standard,
            Mode.EditorList,
            Mode.WorkspaceList,
            Mode.HeadingsList,
            Mode.BookmarksList,
            Mode.CommandList,
            Mode.VaultList,
        ].forEach((mode) => {
            parsedCmds[mode] = InputInfo.defaultParsedCommand;
        });
    }
    buildSearchQuery() {
        const { mode } = this;
        const input = this.parsedCommands[mode].parsedInput ?? '';
        const prepQuery = obsidian.prepareQuery(input.trim().toLowerCase());
        const hasSearchTerm = prepQuery?.query?.length > 0;
        this._searchQuery = { prepQuery, hasSearchTerm };
    }
    parsedCommand(mode) {
        mode = mode ?? this.mode;
        return this.parsedCommands[mode];
    }
}

class Handler {
    constructor(app, settings) {
        this.app = app;
        this.settings = settings;
    }
    reset() {
        /* noop */
    }
    onNoResultsCreateAction(_inputInfo, _evt) {
        return false;
    }
    getFacets(mode) {
        if (!this.facets) {
            const facetList = this.settings?.quickFilters?.facetList;
            if (facetList) {
                this.facets = Object.values(facetList).filter((facet) => facet.mode === mode);
            }
        }
        return this.facets ?? [];
    }
    getAvailableFacets(inputInfo) {
        return this.getFacets(inputInfo.mode).filter((v) => v.isAvailable);
    }
    activateFacet(facets, isActive) {
        facets.forEach((v) => (v.isActive = isActive));
        if (!this.settings.quickFilters.shouldResetActiveFacets) {
            this.settings.save();
        }
    }
    getActiveFacetIds(inputInfo) {
        const facetIds = this.getAvailableFacets(inputInfo)
            .filter((v) => v.isActive)
            .map((v) => v.id);
        return new Set(facetIds);
    }
    isFacetedWith(activeFacetIds, facetId) {
        const hasActiveFacets = !!activeFacetIds.size;
        return (hasActiveFacets && activeFacetIds.has(facetId)) || !hasActiveFacets;
    }
    getEditorInfo(leaf) {
        const { excludeViewTypes } = this.settings;
        let file = null;
        let isValidSource = false;
        let cursor = null;
        if (leaf) {
            const { view } = leaf;
            const viewType = view.getViewType();
            file = view.file;
            cursor = this.getCursorPosition(view);
            // determine if the current active editor pane is valid
            const isCurrentEditorValid = !excludeViewTypes.includes(viewType);
            // whether or not the current active editor can be used as the target for
            // symbol search
            isValidSource = isCurrentEditorValid && !!file;
        }
        return { isValidSource, leaf, file, suggestion: null, cursor };
    }
    getSuggestionInfo(suggestion) {
        const info = this.getSourceInfoFromSuggestion(suggestion);
        let leaf = info.leaf;
        if (info.isValidSource) {
            // try to find a matching leaf for suggestion types that don't explicitly
            // provide one. This is primarily needed to be able to focus an
            // existing pane if there is one
            ({ leaf } = this.findMatchingLeaf(info.file, info.leaf));
        }
        // Get the cursor information to support `selectNearestHeading`
        const cursor = this.getCursorPosition(leaf?.view);
        return { ...info, leaf, cursor };
    }
    getSourceInfoFromSuggestion(suggestion) {
        let file = null;
        let leaf = null;
        // Can't use these suggestions as the target for another symbol command,
        // because they don't point to a file
        const invalidTypes = [
            SuggestionType.SymbolList,
            SuggestionType.Unresolved,
            SuggestionType.WorkspaceList,
            SuggestionType.CommandList,
            SuggestionType.VaultList,
        ];
        const isFileBasedSuggestion = suggestion && !invalidTypes.includes(suggestion.type);
        if (isFileBasedSuggestion) {
            file = suggestion.file;
        }
        if (isEditorSuggestion(suggestion)) {
            leaf = suggestion.item;
        }
        const isValidSource = !!file;
        return { isValidSource, leaf, file, suggestion };
    }
    /**
     * Retrieves the position of the cursor, given that view is in a Mode that supports cursors.
     * @param  {View} view
     * @returns EditorPosition
     */
    getCursorPosition(view) {
        let cursor = null;
        if (view?.getViewType() === 'markdown') {
            const md = view;
            if (md.getMode() !== 'preview') {
                const { editor } = md;
                cursor = editor.getCursor('head');
            }
        }
        return cursor;
    }
    /**
     * Returns the text of the first H1 contained in sourceFile, or sourceFile
     * path if an H1 does not exist
     * @param  {TFile} sourceFile
     * @returns string
     */
    getTitleText(sourceFile) {
        const path = stripMDExtensionFromPath(sourceFile);
        const h1 = this.getFirstH1(sourceFile);
        return h1?.heading ?? path;
    }
    /**
     * Finds and returns the first H1 from sourceFile
     * @param  {TFile} sourceFile
     * @returns HeadingCache
     */
    getFirstH1(sourceFile) {
        return Handler.getFirstH1(sourceFile, this.app.metadataCache);
    }
    static getFirstH1(sourceFile, metadataCache) {
        let h1 = null;
        const headingList = metadataCache.getFileCache(sourceFile)?.headings?.filter((v) => v.level === 1) ??
            [];
        if (headingList.length) {
            h1 = headingList.reduce((acc, curr) => {
                const { line: currLine } = curr.position.start;
                const accLine = acc.position.start.line;
                return currLine < accLine ? curr : acc;
            });
        }
        return h1;
    }
    /**
     * Finds the first open WorkspaceLeaf that is showing source file.
     * @param  {TFile} file The source file that is being shown to find
     * @param  {WorkspaceLeaf} leaf An already open editor, or, a 'reference' WorkspaceLeaf (example: backlinks, outline, etc.. views) that is used to find the associated editor if one exists.
     * @param  {} shouldIncludeRefViews=false set to true to make reference view types valid return candidates.
     * @returns TargetInfo
     */
    findMatchingLeaf(file, leaf, shouldIncludeRefViews = false) {
        let matchingLeaf = null;
        const hasSourceLeaf = !!leaf;
        const { settings: { referenceViews, excludeViewTypes, includeSidePanelViewTypes }, } = this;
        const isMatch = (candidateLeaf) => {
            let val = false;
            if (candidateLeaf?.view) {
                const isCandidateRefView = referenceViews.includes(candidateLeaf.view.getViewType());
                const isValidCandidate = shouldIncludeRefViews || !isCandidateRefView;
                const isSourceRefView = hasSourceLeaf && referenceViews.includes(leaf.view.getViewType());
                if (isValidCandidate) {
                    if (hasSourceLeaf && (shouldIncludeRefViews || !isSourceRefView)) {
                        val = candidateLeaf === leaf;
                    }
                    else {
                        val = candidateLeaf.view.file === file;
                    }
                }
            }
            return val;
        };
        // Prioritize the active leaf matches first, otherwise find the first matching leaf
        const activeLeaf = this.getActiveLeaf();
        if (isMatch(activeLeaf)) {
            matchingLeaf = activeLeaf;
        }
        else {
            const leaves = this.getOpenLeaves(excludeViewTypes, includeSidePanelViewTypes);
            // put leaf at the first index so it gets checked first
            matchingLeaf = [leaf, ...leaves].find(isMatch);
        }
        return {
            leaf: matchingLeaf ?? null,
            file,
            suggestion: null,
            isValidSource: false,
        };
    }
    /** Determines if an existing tab should be reused, or create new tab, or create new window based on evt and taking into account user preferences
     * @param  {MouseEvent|KeyboardEvent} evt
     * @param  {boolean} isAlreadyOpen?
     * @param  {Mode} mode? Only Symbol mode has special handling.
     * @returns {navType: boolean | PaneType; splitDirection: SplitDirection}
     */
    extractTabNavigationType(evt, isAlreadyOpen, mode) {
        const splitDirection = evt?.shiftKey ? 'horizontal' : 'vertical';
        const key = evt?.key;
        let navType = obsidian.Keymap.isModEvent(evt) ?? false;
        if (navType === true || navType === 'tab') {
            if (key === 'o') {
                // cmd-o to create new window
                navType = 'window';
            }
            else if (key === '\\') {
                // cmd-\ to create split
                navType = 'split';
            }
        }
        navType = this.applyTabCreationPreferences(navType, isAlreadyOpen, mode);
        return { navType, splitDirection };
    }
    /**
     * Determines whether or not a new leaf should be created taking user
     * settings into account
     * @param  {PaneType | boolean} navType
     * @param  {} isAlreadyOpen=false Set to true if there is a pane showing the file already
     * @param  {Mode} mode? Only Symbol mode has special handling.
     * @returns boolean
     */
    applyTabCreationPreferences(navType, isAlreadyOpen = false, mode) {
        let preferredNavType = navType;
        const { onOpenPreferNewTab, alwaysNewTabForSymbols, useActiveTabForSymbolsOnMobile } = this.settings;
        if (navType === false) {
            if (onOpenPreferNewTab) {
                preferredNavType = !isAlreadyOpen;
            }
            else if (mode === Mode.SymbolList) {
                preferredNavType = obsidian.Platform.isMobile
                    ? !useActiveTabForSymbolsOnMobile
                    : alwaysNewTabForSymbols;
            }
        }
        return preferredNavType;
    }
    /**
     * Determines if a leaf belongs to the main editor panel (workspace.rootSplit or
     * workspace.floatingSplit) as opposed to the side panels
     * @param  {WorkspaceLeaf} leaf
     * @returns boolean
     */
    isMainPanelLeaf(leaf) {
        const { workspace } = this.app;
        const root = leaf?.getRoot();
        return root === workspace.rootSplit || root === workspace.floatingSplit;
    }
    /**
     * Reveals and optionally bring into focus a WorkspaceLeaf, including leaves
     * from the side panels.
     * @param  {WorkspaceLeaf} leaf
     * @param  {Record<string, unknown>} eState?
     * @returns void
     */
    activateLeaf(leaf, eState) {
        const { workspace } = this.app;
        const isInSidePanel = !this.isMainPanelLeaf(leaf);
        const state = { focus: true, ...eState };
        if (isInSidePanel) {
            workspace.revealLeaf(leaf);
        }
        workspace.setActiveLeaf(leaf, { focus: true });
        leaf.view.setEphemeralState(state);
    }
    /**
     * Returns a array of all open WorkspaceLeaf taking into account
     * excludeMainPanelViewTypes and includeSidePanelViewTypes.
     * @param  {string[]} excludeMainPanelViewTypes?
     * @param  {string[]} includeSidePanelViewTypes?
     * @returns WorkspaceLeaf[]
     */
    getOpenLeaves(excludeMainPanelViewTypes, includeSidePanelViewTypes, options) {
        const leaves = [];
        const saveLeaf = (l) => {
            const viewType = l?.view?.getViewType();
            if (this.isMainPanelLeaf(l)) {
                if (!excludeMainPanelViewTypes?.includes(viewType)) {
                    leaves.push(l);
                }
            }
            else if (includeSidePanelViewTypes?.includes(viewType)) {
                leaves.push(l);
            }
        };
        this.app.workspace.iterateAllLeaves(saveLeaf);
        if (options?.orderByAccessTime) {
            leaves.sort((a, b) => {
                const t1 = a?.activeTime ?? 0;
                const t2 = b?.activeTime ?? 0;
                return t2 - t1;
            });
        }
        return leaves;
    }
    /**
     * Loads a file into a WorkspaceLeaf based on navType
     * @param  {TFile} file
     * @param  {PaneType|boolean} navType
     * @param  {OpenViewState} openState?
     * @param  {SplitDirection} splitDirection if navType is 'split', the direction to
     * open the split. Defaults to 'vertical'
     * @returns void
     */
    async openFileInLeaf(file, navType, openState, splitDirection = 'vertical') {
        const { workspace } = this.app;
        const leaf = navType === 'split'
            ? workspace.getLeaf(navType, splitDirection)
            : workspace.getLeaf(navType);
        await leaf.openFile(file, openState);
    }
    /**
     * Determines whether to activate (make active and focused) an existing WorkspaceLeaf
     * (searches through all leaves), or create a new WorkspaceLeaf, or reuse an unpinned
     * WorkspaceLeaf, or create a new window in order to display file. This takes user
     * settings and event status into account.
     * @param  {MouseEvent|KeyboardEvent} evt navigation trigger event
     * @param  {TFile} file The file to display
     * @param  {string} errorContext Custom text to save in error messages
     * @param  {OpenViewState} openState? State to pass to the new, or activated view. If
     * falsy, default values will be used
     * @param  {WorkspaceLeaf} leaf? WorkspaceLeaf, or reference WorkspaceLeaf
     * (backlink, outline, etc..) to activate if it's already known
     * @param  {Mode} mode? Only Symbol mode has custom handling
     * @param  {boolean} shouldIncludeRefViews whether reference WorkspaceLeaves are valid
     * targets for activation
     * @returns void
     */
    navigateToLeafOrOpenFile(evt, file, errorContext, openState, leaf, mode, shouldIncludeRefViews = false) {
        this.navigateToLeafOrOpenFileAsync(evt, file, openState, leaf, mode, shouldIncludeRefViews).catch((reason) => {
            console.log(`Switcher++: error navigating to open file. ${errorContext}`, reason);
        });
    }
    /**
     * Determines whether to activate (make active and focused) an existing WorkspaceLeaf
     * (searches through all leaves), or create a new WorkspaceLeaf, or reuse an unpinned
     * WorkspaceLeaf, or create a new window in order to display file. This takes user
     * settings and event status into account.
     * @param  {MouseEvent|KeyboardEvent} evt navigation trigger event
     * @param  {TFile} file The file to display
     * @param  {OpenViewState} openState? State to pass to the new, or activated view. If
     * falsy, default values will be used
     * @param  {WorkspaceLeaf} leaf? WorkspaceLeaf, or reference WorkspaceLeaf
     * (backlink, outline, etc..) to activate if it's already known
     * @param  {Mode} mode? Only Symbol mode has custom handling
     * @param  {boolean} shouldIncludeRefViews whether reference WorkspaceLeaves are valid
     * targets for activation
     * @returns void
     */
    async navigateToLeafOrOpenFileAsync(evt, file, openState, leaf, mode, shouldIncludeRefViews = false) {
        const { leaf: targetLeaf } = this.findMatchingLeaf(file, leaf, shouldIncludeRefViews);
        const isAlreadyOpen = !!targetLeaf;
        const { navType, splitDirection } = this.extractTabNavigationType(evt, isAlreadyOpen, mode);
        await this.activateLeafOrOpenFile(navType, file, targetLeaf, openState, splitDirection);
    }
    /**
     * Activates leaf (if provided), or load file into another leaf based on navType
     * @param  {PaneType|boolean} navType
     * @param  {TFile} file
     * @param  {WorkspaceLeaf} leaf? optional if supplied and navType is
     * false then leaf will be activated
     * @param  {OpenViewState} openState?
     * @param  {SplitDirection} splitDirection? if navType is 'split', the direction to
     * open the split
     * @returns void
     */
    async activateLeafOrOpenFile(navType, file, leaf, openState, splitDirection) {
        // default to having the pane active and focused
        openState = openState ?? { active: true, eState: { active: true, focus: true } };
        if (leaf && navType === false) {
            const eState = openState?.eState;
            this.activateLeaf(leaf, eState);
        }
        else {
            await this.openFileInLeaf(file, navType, openState, splitDirection);
        }
    }
    /**
     * Renders the UI elements to display path information for file using the
     * stored configuration settings
     * @param  {HTMLElement} parentEl containing element, this should be the element with
     * the "suggestion-content" style
     * @param  {TFile} file
     * @param  {boolean} excludeOptionalFilename? set to true to hide the filename in cases
     * where when {PathDisplayFormat} is set to FolderPathFilenameOptional
     * @param  {SearchResult} match?
     * @param  {boolean} overridePathFormat? set to true force display the path and set
     * {PathDisplayFormat} to FolderPathFilenameOptional
     * @returns void
     */
    renderPath(parentEl, file, excludeOptionalFilename, match, overridePathFormat) {
        if (parentEl && file) {
            const isRoot = file.parent.isRoot();
            let format = this.settings.pathDisplayFormat;
            let hidePath = format === PathDisplayFormat.None || (isRoot && this.settings.hidePathIfRoot);
            if (overridePathFormat) {
                format = PathDisplayFormat.FolderPathFilenameOptional;
                hidePath = false;
            }
            if (!hidePath) {
                const wrapperEl = parentEl.createDiv({ cls: ['suggestion-note', 'qsp-note'] });
                const path = this.getPathDisplayText(file, format, excludeOptionalFilename);
                const iconEl = wrapperEl.createSpan({ cls: ['qsp-path-indicator'] });
                obsidian.setIcon(iconEl, 'folder');
                const pathEl = wrapperEl.createSpan({ cls: 'qsp-path' });
                obsidian.renderResults(pathEl, path, match);
            }
        }
    }
    /**
     * Formats the path of file based on displayFormat
     * @param  {TFile} file
     * @param  {PathDisplayFormat} displayFormat
     * @param  {boolean} excludeOptionalFilename? Only applicable to
     * {PathDisplayFormat.FolderPathFilenameOptional}. When true will exclude the filename from the returned string
     * @returns string
     */
    getPathDisplayText(file, displayFormat, excludeOptionalFilename) {
        let text = '';
        if (file) {
            const { parent } = file;
            const dirname = parent.name;
            const isRoot = parent.isRoot();
            // root path is expected to always be "/"
            const rootPath = this.app.vault.getRoot().path;
            switch (displayFormat) {
                case PathDisplayFormat.FolderWithFilename:
                    text = isRoot ? `${file.name}` : obsidian.normalizePath(`${dirname}/${file.name}`);
                    break;
                case PathDisplayFormat.FolderOnly:
                    text = isRoot ? rootPath : dirname;
                    break;
                case PathDisplayFormat.Full:
                    text = file.path;
                    break;
                case PathDisplayFormat.FolderPathFilenameOptional:
                    if (excludeOptionalFilename) {
                        text = parent.path;
                        if (!isRoot) {
                            text += rootPath; // add explicit trailing /
                        }
                    }
                    else {
                        text = this.getPathDisplayText(file, PathDisplayFormat.Full);
                    }
                    break;
            }
        }
        return text;
    }
    /**
     * Creates the UI elements to display the primary suggestion text using
     * the correct styles.
     * @param  {HTMLElement} parentEl containing element, this should be the element with
     * the "suggestion-item" style
     * @param  {string} content
     * @param  {SearchResult} match
     * @param  {number} offset?
     * @returns HTMLDivElement
     */
    renderContent(parentEl, content, match, offset) {
        const contentEl = parentEl.createDiv({
            cls: ['suggestion-content', 'qsp-content'],
        });
        const titleEl = contentEl.createDiv({
            cls: ['suggestion-title', 'qsp-title'],
        });
        obsidian.renderResults(titleEl, content, match, offset);
        return contentEl;
    }
    /** add the base suggestion styles to the suggestion container element
     * @param  {HTMLElement} parentEl container element
     * @param  {string[]} additionalStyles? optional styles to add
     */
    addClassesToSuggestionContainer(parentEl, additionalStyles) {
        const styles = ['mod-complex'];
        if (additionalStyles) {
            styles.push(...additionalStyles);
        }
        parentEl?.addClasses(styles);
    }
    /**
     * Searches through primaryString, if not match is found,
     * searches through secondaryString
     * @param  {PreparedQuery} prepQuery
     * @param  {string} primaryString
     * @param  {string} secondaryString?
     * @returns { isPrimary: boolean; match?: SearchResult }
     */
    fuzzySearchStrings(prepQuery, primaryString, secondaryString) {
        let isPrimary = false;
        let match = null;
        if (primaryString) {
            match = obsidian.fuzzySearch(prepQuery, primaryString);
            isPrimary = !!match;
        }
        if (!match && secondaryString) {
            match = obsidian.fuzzySearch(prepQuery, secondaryString);
            if (match) {
                match.score -= 1;
            }
        }
        return {
            isPrimary,
            match,
        };
    }
    /**
     * Searches through primaryText, if no match is found and file is not null, it will
     * fallback to searching 1) file.basename, 2) file.path
     * @param  {PreparedQuery} prepQuery
     * @param  {string} primaryString
     * @param  {PathSegments} pathSegments? TFile like object containing the basename and full path.
     * @returns SearchResultWithFallback
     */
    fuzzySearchWithFallback(prepQuery, primaryString, pathSegments) {
        let matchType = MatchType.None;
        let matchText;
        let match = null;
        let res = this.fuzzySearchStrings(prepQuery, primaryString);
        if (res.match) {
            match = res.match;
            matchType = MatchType.Primary;
            matchText = primaryString;
        }
        else if (pathSegments) {
            const { basename, path } = pathSegments;
            // Note: the fallback to path has to search through the entire path
            // because search needs to match over the filename/basename boundaries
            // e.g. search string "to my" should match "path/to/myfile.md"
            // that means MatchType.Basename will always be in the basename, while
            // MatchType.ParentPath can span both filename and basename
            res = this.fuzzySearchStrings(prepQuery, basename, path);
            if (res.isPrimary) {
                matchType = MatchType.Basename;
                matchText = basename;
            }
            else if (res.match) {
                matchType = MatchType.Path;
                matchText = path;
            }
            match = res.match;
        }
        return { matchType, matchText, match };
    }
    /**
     * Separate match into two groups, one that only matches the path segment of file, and
     * a second that only matches the filename segment
     * @param  {PathSegments} pathSegments
     * @param  {SearchResult} match
     * @returns {SearchResult; SearchResult}
     */
    splitSearchMatchesAtBasename(pathSegments, match) {
        let basenameMatch = null;
        let pathMatch = null;
        // function to re-anchor offsets by a certain amount
        const decrementOffsets = (offsets, amount) => {
            offsets.forEach((offset) => {
                offset[0] -= amount;
                offset[1] -= amount;
            });
        };
        if (pathSegments && match?.matches) {
            const nameIndex = pathSegments.path.lastIndexOf(pathSegments.basename);
            if (nameIndex >= 0) {
                const { matches, score } = match;
                const matchStartIndex = matches[0][0];
                const matchEndIndex = matches[matches.length - 1][1];
                if (matchStartIndex >= nameIndex) {
                    // the entire match offset is in the basename segment, so match can be used
                    // for basename
                    basenameMatch = match;
                    decrementOffsets(basenameMatch.matches, nameIndex);
                }
                else if (matchEndIndex <= nameIndex) {
                    // the entire match offset is in the path segment
                    pathMatch = match;
                }
                else {
                    // the match offset spans both path and basename, so they will have to
                    // to be split up. Note that the entire SearchResult can span both, and
                    // a single SearchMatchPart inside the SearchResult can also span both
                    let i = matches.length;
                    while (i--) {
                        const matchPartStartIndex = matches[i][0];
                        const matchPartEndIndex = matches[i][1];
                        const nextMatchPartIndex = i + 1;
                        if (matchPartEndIndex <= nameIndex) {
                            // the last path segment MatchPart ends cleanly in the path segment
                            pathMatch = { score, matches: matches.slice(0, nextMatchPartIndex) };
                            basenameMatch = { score, matches: matches.slice(nextMatchPartIndex) };
                            decrementOffsets(basenameMatch.matches, nameIndex);
                            break;
                        }
                        else if (matchPartStartIndex < nameIndex) {
                            // the last MatchPart starts in path segment and ends in basename segment
                            // adjust the end of the path segment MatchPart to finish at the end
                            // of the path segment
                            let offsets = matches.slice(0, nextMatchPartIndex);
                            offsets[offsets.length - 1] = [matchPartStartIndex, nameIndex];
                            pathMatch = { score, matches: offsets };
                            // adjust the beginning of the first basename segment MatchPart to start
                            // at the beginning of the basename segment
                            offsets = matches.slice(i);
                            decrementOffsets(offsets, nameIndex);
                            offsets[0][0] = 0;
                            basenameMatch = { score, matches: offsets };
                            break;
                        }
                    }
                }
            }
        }
        return { pathMatch, basenameMatch };
    }
    /**
     * Display the provided information as a suggestion with the content and path information on separate lines
     * @param  {HTMLElement} parentEl
     * @param  {string[]} parentElStyles
     * @param  {string} primaryString
     * @param  {TFile} file
     * @param  {MatchType} matchType
     * @param  {SearchResult} match
     * @param  {} excludeOptionalFilename=true
     * @returns void
     */
    renderAsFileInfoPanel(parentEl, parentElStyles, primaryString, file, matchType, match, excludeOptionalFilename = true) {
        let primaryMatch = null;
        let pathMatch = null;
        if (primaryString?.length) {
            if (matchType === MatchType.Primary) {
                primaryMatch = match;
            }
            else if (matchType === MatchType.Path) {
                pathMatch = match;
            }
        }
        else if (file) {
            primaryString = file.basename;
            if (matchType === MatchType.Basename) {
                primaryMatch = match;
            }
            else if (matchType === MatchType.Path) {
                // MatchType.ParentPath can span both filename and basename
                // (partial match in each) so try to split the match offsets
                ({ pathMatch, basenameMatch: primaryMatch } = this.splitSearchMatchesAtBasename(file, match));
            }
        }
        this.addClassesToSuggestionContainer(parentEl, parentElStyles);
        const contentEl = this.renderContent(parentEl, primaryString, primaryMatch);
        this.renderPath(contentEl, file, excludeOptionalFilename, pathMatch, !!pathMatch);
    }
    /**
     * Returns the currently active leaf across all root workspace splits
     * @returns WorkspaceLeaf | null
     */
    getActiveLeaf() {
        return Handler.getActiveLeaf(this.app.workspace);
    }
    /**
     * Returns the currently active leaf across all root workspace splits
     * @param  {Workspace} workspace
     * @returns WorkspaceLeaf | null
     */
    static getActiveLeaf(workspace) {
        const leaf = workspace?.getActiveViewOfType(obsidian.View)?.leaf;
        return leaf ?? null;
    }
    /**
     * Displays extra flair icons for an item, and adds any associated css classes
     * to parentEl
     * @param  {HTMLElement} parentEl the suggestion container element
     * @param  {AnySuggestion} sugg the suggestion item
     * @param  {HTMLDivElement=null} flairContainerEl optional, if null, it will be created
     * @returns HTMLDivElement the flairContainerEl that was passed in or created
     */
    renderOptionalIndicators(parentEl, sugg, flairContainerEl = null) {
        const { showOptionalIndicatorIcons } = this.settings;
        const indicatorData = new Map();
        indicatorData.set('isRecent', {
            iconName: 'history',
            parentElClass: 'qsp-recent-file',
            indicatorElClass: 'qsp-recent-indicator',
        });
        indicatorData.set('isOpenInEditor', {
            iconName: 'lucide-file-edit',
            parentElClass: 'qsp-open-editor',
            indicatorElClass: 'qsp-editor-indicator',
        });
        indicatorData.set('isBookmarked', {
            iconName: 'lucide-bookmark',
            parentElClass: 'qsp-bookmarked-file',
            indicatorElClass: 'qsp-bookmarked-indicator',
        });
        if (!flairContainerEl) {
            flairContainerEl = this.createFlairContainer(parentEl);
        }
        if (showOptionalIndicatorIcons) {
            for (const [state, data] of indicatorData.entries()) {
                if (sugg[state] === true) {
                    if (data.parentElClass) {
                        parentEl?.addClass(data.parentElClass);
                    }
                    this.renderIndicator(flairContainerEl, [data.indicatorElClass], data.iconName);
                }
            }
        }
        return flairContainerEl;
    }
    /**
     * @param  {HTMLDivElement} flairContainerEl
     * @param  {string[]} indicatorClasses additional css classes to add to flair element
     * @param  {string} svgIconName? the name of the svg icon to use
     * @param  {string} indicatorText? the text content of the flair element
     * @returns HTMLElement the flair icon wrapper element
     */
    renderIndicator(flairContainerEl, indicatorClasses, svgIconName, indicatorText) {
        const cls = ['suggestion-flair', ...indicatorClasses];
        const flairEl = flairContainerEl?.createSpan({ cls });
        if (flairEl) {
            if (svgIconName) {
                flairEl.addClass('svg-icon');
                obsidian.setIcon(flairEl, svgIconName);
            }
            if (indicatorText) {
                flairEl.setText(indicatorText);
            }
        }
        return flairEl;
    }
    /**
     * Creates a child Div element with the appropriate css classes for flair icons
     * @param  {HTMLElement} parentEl
     * @returns HTMLDivElement
     */
    createFlairContainer(parentEl) {
        return parentEl?.createDiv({ cls: ['suggestion-aux', 'qsp-aux'] });
    }
    /**
     * Retrieves a TFile object using path. Return null if path does not represent
     * a TFile object.
     * @param  {string} path
     * @returns TFile|null
     */
    getTFileByPath(path) {
        return getTFileByPath(path, this.app.vault);
    }
    /**
     * Downranks suggestions for files that live in Obsidian ignored paths, or,
     * increases the suggestion score by a factor specified in settings. This instance
     * version just forwards to the static version
     * @param  {V} sugg the suggestion objects
     * @returns V
     */
    applyMatchPriorityPreferences(sugg) {
        return Handler.applyMatchPriorityPreferences(sugg, this.settings, this.app.metadataCache);
    }
    /**
     * Downranks suggestions for files that live in Obsidian ignored paths, or,
     * increases the suggestion score by a factor specified in settings.
     * @param  {V} sugg the suggestion objects
     * @param  {SwitcherPlusSettings} settings
     * @param  {MetadataCache} metadataCache
     * @returns V
     */
    static applyMatchPriorityPreferences(sugg, settings, metadataCache) {
        if (sugg?.match) {
            const { match, type, file } = sugg;
            if (file && metadataCache?.isUserIgnored(file.path)) {
                // downrank suggestions that are in an obsidian ignored paths
                sugg.downranked = true;
                sugg.match.score -= 10;
            }
            else if (settings?.matchPriorityAdjustments?.isEnabled) {
                const { matchPriorityAdjustments } = settings;
                const adjustments = matchPriorityAdjustments.adjustments ?? {};
                const fileExtAdjustments = matchPriorityAdjustments.fileExtAdjustments ?? {};
                let factor = 0;
                const getFactor = (key, collection) => {
                    collection = collection ?? adjustments;
                    let val = 0;
                    if (Object.prototype.hasOwnProperty.call(collection, key)) {
                        val = Number(collection[key]?.value);
                    }
                    return isNaN(val) ? 0 : val;
                };
                const getFactorConstrained = (searchType, searchKey) => {
                    let val = 0;
                    if ((searchType !== null && searchType === type) || sugg[searchKey]) {
                        val = getFactor(searchKey);
                    }
                    return val;
                };
                factor += getFactorConstrained(SuggestionType.Bookmark, 'isBookmarked');
                factor += getFactorConstrained(SuggestionType.EditorList, 'isOpenInEditor');
                factor += getFactorConstrained(null, 'isRecent');
                factor += getFactorConstrained(null, 'isAttachment');
                factor += getFactor(file?.extension, fileExtAdjustments);
                if (isHeadingSuggestion(sugg)) {
                    factor += getFactor(`h${sugg.item?.level}`);
                }
                // check for adjustments defined for other suggestion types, the types that are
                // explicitly checked above should not be in the adjustment list so
                // they don't get counted twice (above and then again here)
                const typeStr = type.toString();
                factor += getFactor(typeStr);
                // update score by the percentage define by factor
                // find one percent of score by dividing the absolute value of score by 100,
                // multiply factor by 100 to convert into percentage
                // multiply the two to get the change amount, and add it to score
                match.score += (Math.abs(match.score) / 100) * (factor * 100);
            }
        }
        return sugg;
    }
    /**
     * Sets isOpenInEditor, isRecent, isBookmarked, isAttachment, status of sugg
     * based on currentWorkspaceEnvList
     * @param  {WorkspaceEnvList} currentWorkspaceEnvList
     * @param  {V} sugg
     * @returns V
     */
    static updateWorkspaceEnvListStatus(currentWorkspaceEnvList, sugg) {
        if (currentWorkspaceEnvList && sugg?.file) {
            const { file } = sugg;
            sugg.isOpenInEditor = currentWorkspaceEnvList.openWorkspaceFiles?.has(file);
            sugg.isRecent = currentWorkspaceEnvList.mostRecentFiles?.has(file);
            sugg.isBookmarked = currentWorkspaceEnvList.fileBookmarks?.has(file);
            sugg.isAttachment = currentWorkspaceEnvList.attachmentFileExtensions?.has(file.extension);
        }
        return sugg;
    }
    /**
     * Renders a suggestion hint for creating a new note
     * @param  {HTMLElement} parentEl
     * @param  {string} filename
     * @returns HTMLDivElement
     */
    renderFileCreationSuggestion(parentEl, filename) {
        this.addClassesToSuggestionContainer(parentEl);
        const contentEl = this.renderContent(parentEl, filename, null);
        const flairEl = this.createFlairContainer(parentEl);
        flairEl?.createSpan({
            cls: 'suggestion-hotkey',
            text: 'Enter to create',
        });
        return contentEl;
    }
    /**
     * Creates a new note in the vault with filename. Uses evt to determine the
     * navigation type (reuse tab, new tab, new window) to use for opening the newly
     * created note.
     * @param  {string} filename
     * @param  {MouseEvent|KeyboardEvent} evt
     * @returns void
     */
    createFile(filename, evt) {
        const { workspace } = this.app;
        const { navType } = this.extractTabNavigationType(evt);
        const activeView = workspace.getActiveViewOfType(obsidian.FileView);
        let sourcePath = '';
        if (activeView?.file) {
            sourcePath = activeView.file.path;
        }
        workspace
            .openLinkText(filename, sourcePath, navType, { active: true })
            .catch((err) => {
            console.log('Switcher++: error creating new file. ', err);
        });
    }
}

const WORKSPACE_PLUGIN_ID = 'workspaces';
class WorkspaceHandler extends Handler {
    getCommandString(_sessionOpts) {
        return this.settings?.workspaceListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        const cmd = inputInfo.parsedCommand(Mode.WorkspaceList);
        if (this.getEnabledWorkspacesPluginInstance()) {
            inputInfo.mode = Mode.WorkspaceList;
            cmd.index = index;
            cmd.parsedInput = filterText;
            cmd.isValidated = true;
        }
        return cmd;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const items = this.getItems();
            items.forEach((item) => {
                let shouldPush = true;
                let match = null;
                if (hasSearchTerm) {
                    match = obsidian.fuzzySearch(prepQuery, item.id);
                    shouldPush = !!match;
                }
                if (shouldPush) {
                    suggestions.push({ type: SuggestionType.WorkspaceList, item, match });
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            this.addClassesToSuggestionContainer(parentEl, ['qsp-suggestion-workspace']);
            this.renderContent(parentEl, sugg.item.id, sugg.match);
            handled = true;
        }
        return handled;
    }
    onChooseSuggestion(sugg, _evt) {
        let handled = false;
        if (sugg) {
            const { id } = sugg.item;
            const pluginInstance = this.getEnabledWorkspacesPluginInstance();
            if (pluginInstance) {
                pluginInstance.loadWorkspace(id);
            }
            handled = true;
        }
        return handled;
    }
    onNoResultsCreateAction(inputInfo, _evt) {
        const pluginInstance = this.getEnabledWorkspacesPluginInstance();
        if (pluginInstance) {
            const input = inputInfo.parsedCommand(Mode.WorkspaceList)?.parsedInput;
            // create a new workspace and set it active
            pluginInstance.saveWorkspace(input);
            pluginInstance.setActiveWorkspace(input);
        }
        return true;
    }
    getItems() {
        const items = [];
        const workspaces = this.getEnabledWorkspacesPluginInstance()?.workspaces;
        if (workspaces) {
            Object.keys(workspaces).forEach((id) => items.push({ id, type: 'workspaceInfo' }));
        }
        return items.sort((a, b) => a.id.localeCompare(b.id));
    }
    getEnabledWorkspacesPluginInstance() {
        return getInternalEnabledPluginById(this.app, WORKSPACE_PLUGIN_ID);
    }
}

class StandardExHandler extends Handler {
    getCommandString(_sessionOpts) {
        return '';
    }
    validateCommand(_inputInfo, _index, _filterText, _activeSuggestion, _activeLeaf) {
        throw new Error('Method not implemented.');
    }
    getSuggestions(_inputInfo) {
        throw new Error('Method not implemented.');
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (isFileSuggestion(sugg)) {
            handled = this.renderFileSuggestion(sugg, parentEl);
        }
        else {
            handled = this.renderAliasSuggestion(sugg, parentEl);
        }
        if (sugg?.downranked) {
            parentEl.addClass('mod-downranked');
        }
        return handled;
    }
    onChooseSuggestion(sugg, evt) {
        let handled = false;
        if (sugg) {
            const { file } = sugg;
            this.navigateToLeafOrOpenFile(evt, file, `Unable to open file from SystemSuggestion ${file.path}`);
            handled = true;
        }
        return handled;
    }
    renderFileSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { file, matchType, match } = sugg;
            this.renderAsFileInfoPanel(parentEl, ['qsp-suggestion-file'], null, file, matchType, match);
            this.renderOptionalIndicators(parentEl, sugg);
            handled = true;
        }
        return handled;
    }
    renderAliasSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { file, matchType, match } = sugg;
            this.renderAsFileInfoPanel(parentEl, ['qsp-suggestion-alias'], sugg.alias, file, matchType, match, false);
            const flairContainerEl = this.renderOptionalIndicators(parentEl, sugg);
            this.renderIndicator(flairContainerEl, ['qsp-alias-indicator'], 'lucide-forward');
            handled = true;
        }
        return handled;
    }
    addPropertiesToStandardSuggestions(inputInfo, sugg) {
        const { match, file } = sugg;
        const matches = match?.matches;
        let matchType = MatchType.None;
        let matchText = null;
        if (matches) {
            if (isAliasSuggestion(sugg)) {
                matchType = MatchType.Primary;
                matchText = sugg.alias;
            }
            else {
                matchType = MatchType.Path;
                matchText = file?.path;
            }
        }
        sugg.matchType = matchType;
        sugg.matchText = matchText;
        // patch with missing properties required for enhanced custom rendering
        Handler.updateWorkspaceEnvListStatus(inputInfo.currentWorkspaceEnvList, sugg);
    }
    static createUnresolvedSuggestion(linktext, result, settings, metadataCache) {
        const sugg = {
            linktext,
            type: SuggestionType.Unresolved,
            ...result,
        };
        return Handler.applyMatchPriorityPreferences(sugg, settings, metadataCache);
    }
}

class EditorHandler extends Handler {
    getCommandString(_sessionOpts) {
        return this.settings?.editorListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        inputInfo.mode = Mode.EditorList;
        const cmd = inputInfo.parsedCommand(Mode.EditorList);
        cmd.index = index;
        cmd.parsedInput = filterText;
        cmd.isValidated = true;
        return cmd;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const items = this.getItems();
            items.forEach((item) => {
                const file = item.view?.file;
                let shouldPush = true;
                let result = { matchType: MatchType.None, match: null };
                const preferredTitle = this.getPreferredTitle(item, this.settings.preferredSourceForTitle);
                if (hasSearchTerm) {
                    result = this.fuzzySearchWithFallback(prepQuery, preferredTitle, file);
                    shouldPush = result.matchType !== MatchType.None;
                }
                if (shouldPush) {
                    suggestions.push(this.createSuggestion(inputInfo.currentWorkspaceEnvList, item, file, result, preferredTitle));
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    getPreferredTitle(leaf, titleSource) {
        return EditorHandler.getPreferredTitle(leaf, titleSource, this.app.metadataCache);
    }
    static getPreferredTitle(leaf, titleSource, metadataCache) {
        const { view } = leaf;
        const file = view?.file;
        let text = leaf.getDisplayText();
        if (titleSource === 'H1' && file) {
            const h1 = EditorHandler.getFirstH1(file, metadataCache);
            if (h1) {
                text = text.replace(file.basename, h1.heading);
            }
        }
        return text;
    }
    getItems() {
        const { excludeViewTypes, includeSidePanelViewTypes, orderEditorListByAccessTime: orderByAccessTime, } = this.settings;
        return this.getOpenLeaves(excludeViewTypes, includeSidePanelViewTypes, {
            orderByAccessTime,
        });
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { file, matchType, match } = sugg;
            const hideBasename = [MatchType.None, MatchType.Primary].includes(matchType);
            this.renderAsFileInfoPanel(parentEl, ['qsp-suggestion-editor'], sugg.preferredTitle, file, matchType, match, hideBasename);
            this.renderOptionalIndicators(parentEl, sugg);
            handled = true;
        }
        return handled;
    }
    onChooseSuggestion(sugg, evt) {
        let handled = false;
        if (sugg) {
            this.navigateToLeafOrOpenFile(evt, sugg.file, 'Unable to reopen existing editor in new Leaf.', null, sugg.item, null, true);
            handled = true;
        }
        return handled;
    }
    createSuggestion(currentWorkspaceEnvList, leaf, file, result, preferredTitle) {
        return EditorHandler.createSuggestion(currentWorkspaceEnvList, leaf, file, this.settings, this.app.metadataCache, preferredTitle, result);
    }
    static createSuggestion(currentWorkspaceEnvList, leaf, file, settings, metadataCache, preferredTitle, result) {
        result = result ?? { matchType: MatchType.None, match: null, matchText: null };
        preferredTitle = preferredTitle ?? null;
        let sugg = {
            item: leaf,
            file,
            preferredTitle,
            type: SuggestionType.EditorList,
            ...result,
        };
        sugg = Handler.updateWorkspaceEnvListStatus(currentWorkspaceEnvList, sugg);
        return Handler.applyMatchPriorityPreferences(sugg, settings, metadataCache);
    }
}

const BOOKMARKS_PLUGIN_ID = 'bookmarks';
class BookmarksHandler extends Handler {
    getCommandString(_sessionOpts) {
        return this.settings?.bookmarksListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        const cmd = inputInfo.parsedCommand(Mode.BookmarksList);
        if (this.getEnabledBookmarksPluginInstance()) {
            inputInfo.mode = Mode.BookmarksList;
            cmd.index = index;
            cmd.parsedInput = filterText;
            cmd.isValidated = true;
        }
        return cmd;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const { allBookmarks } = this.getItems(inputInfo);
            allBookmarks.forEach((info) => {
                let shouldPush = true;
                let result = { matchType: MatchType.None, match: null };
                if (hasSearchTerm) {
                    result = this.fuzzySearchWithFallback(prepQuery, info.bookmarkPath);
                    shouldPush = result.matchType !== MatchType.None;
                }
                if (shouldPush) {
                    suggestions.push(this.createSuggestion(inputInfo.currentWorkspaceEnvList, info, result));
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(_sugg, _parentEl) {
        return false;
    }
    onChooseSuggestion(_sugg, _evt) {
        return false;
    }
    getPreferredTitle(pluginInstance, bookmark, file, titleSource) {
        let text = pluginInstance.getItemTitle(bookmark);
        if (titleSource === 'H1' && file) {
            const h1 = this.getFirstH1(file);
            if (h1) {
                // the "#" represents the start of a heading deep link,
                // "#^" represents the the start of a deep block link,
                // so everything before "#" should represent the filename that
                // needs to be replaced with the file title
                text = text.replace(/^[^#]*/, h1.heading);
            }
        }
        return text;
    }
    getItems(inputInfo) {
        const allBookmarks = [];
        const fileBookmarks = new Map();
        const nonFileBookmarks = new Set();
        const pluginInstance = this.getEnabledBookmarksPluginInstance();
        if (pluginInstance) {
            // if inputInfo is not supplied, then all items are expected (disregard facets), so use
            // and empty facet list
            const activeFacetIds = inputInfo
                ? this.getActiveFacetIds(inputInfo)
                : new Set();
            const traverseBookmarks = (bookmarks, path) => {
                bookmarks?.forEach((bookmark) => {
                    if (BookmarksHandler.isBookmarksPluginGroupItem(bookmark)) {
                        traverseBookmarks(bookmark.items, `${path}${bookmark.title}/`);
                    }
                    else if (this.isFacetedWith(activeFacetIds, BOOKMARKS_FACET_ID_MAP[bookmark.type])) {
                        const bookmarkInfo = {
                            item: bookmark,
                            bookmarkPath: null,
                            file: null,
                        };
                        if (BookmarksHandler.isBookmarksPluginFileItem(bookmark)) {
                            const file = this.getTFileByPath(bookmark.path);
                            if (file) {
                                bookmarkInfo.file = file;
                                const infoList = fileBookmarks.get(file) ?? [];
                                infoList.push(bookmarkInfo);
                                fileBookmarks.set(file, infoList);
                            }
                        }
                        else {
                            nonFileBookmarks.add(bookmarkInfo);
                        }
                        const title = this.getPreferredTitle(pluginInstance, bookmark, bookmarkInfo.file, this.settings.preferredSourceForTitle);
                        bookmarkInfo.bookmarkPath = path + title;
                        allBookmarks.push(bookmarkInfo);
                    }
                });
            };
            traverseBookmarks(pluginInstance.items, '');
        }
        return { allBookmarks, fileBookmarks, nonFileBookmarks };
    }
    getEnabledBookmarksPluginInstance() {
        return getInternalEnabledPluginById(this.app, BOOKMARKS_PLUGIN_ID);
    }
    createSuggestion(currentWorkspaceEnvList, bookmarkInfo, result) {
        return BookmarksHandler.createSuggestion(currentWorkspaceEnvList, bookmarkInfo, this.settings, this.app.metadataCache, result);
    }
    static createSuggestion(currentWorkspaceEnvList, bookmarkInfo, settings, metadataCache, result) {
        let sugg = {
            type: SuggestionType.Bookmark,
            item: bookmarkInfo.item,
            bookmarkPath: bookmarkInfo.bookmarkPath,
            file: bookmarkInfo.file,
            ...result,
        };
        sugg = Handler.updateWorkspaceEnvListStatus(currentWorkspaceEnvList, sugg);
        return Handler.applyMatchPriorityPreferences(sugg, settings, metadataCache);
    }
    static isBookmarksPluginFileItem(obj) {
        return isOfType(obj, 'type', 'file');
    }
    static isBookmarksPluginGroupItem(obj) {
        return isOfType(obj, 'type', 'group');
    }
}

class HeadingsHandler extends Handler {
    getCommandString(_sessionOpts) {
        return this.settings?.headingsListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        inputInfo.mode = Mode.HeadingsList;
        const cmd = inputInfo.parsedCommand(Mode.HeadingsList);
        cmd.index = index;
        cmd.parsedInput = filterText;
        cmd.isValidated = true;
        return cmd;
    }
    onChooseSuggestion(sugg, evt) {
        let handled = false;
        if (sugg) {
            const { start: { line, col }, end: endLoc, } = sugg.item.position;
            // state information to highlight the target heading
            const eState = {
                active: true,
                focus: true,
                startLoc: { line, col },
                endLoc,
                line,
                cursor: {
                    from: { line, ch: col },
                    to: { line, ch: col },
                },
            };
            this.navigateToLeafOrOpenFile(evt, sugg.file, 'Unable to navigate to heading for file.', { active: true, eState });
            handled = true;
        }
        return handled;
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { item } = sugg;
            this.addClassesToSuggestionContainer(parentEl, [
                'qsp-suggestion-headings',
                `qsp-headings-l${item.level}`,
            ]);
            const contentEl = this.renderContent(parentEl, item.heading, sugg.match);
            this.renderPath(contentEl, sugg.file);
            // render the flair icons
            const flairContainerEl = this.createFlairContainer(parentEl);
            this.renderOptionalIndicators(parentEl, sugg, flairContainerEl);
            this.renderIndicator(flairContainerEl, ['qsp-headings-indicator'], null, HeadingIndicators[item.level]);
            if (sugg.downranked) {
                parentEl.addClass('mod-downranked');
            }
            handled = true;
        }
        return handled;
    }
    getAvailableFacets(inputInfo) {
        const { settings: { shouldSearchHeadings, shouldSearchBookmarks, shouldSearchFilenames, shouldSearchRecentFiles, builtInSystemOptions: { showAttachments, showAllFileTypes }, }, } = this;
        const externalFilesEnabled = showAttachments || showAllFileTypes;
        // List of facetIds that depend on the corresponding feature being enabled
        const featureEnablementStatus = {
            [HeadingsListFacetIds.RecentFiles]: shouldSearchRecentFiles,
            [HeadingsListFacetIds.Bookmarks]: shouldSearchBookmarks,
            [HeadingsListFacetIds.Filenames]: shouldSearchFilenames,
            [HeadingsListFacetIds.Headings]: shouldSearchHeadings,
            [HeadingsListFacetIds.ExternalFiles]: externalFilesEnabled,
        };
        return this.getFacets(inputInfo.mode).filter((facet) => {
            // If the facetId exists in the feature list, set its availability to the
            // corresponding feature availability
            if (Object.prototype.hasOwnProperty.call(featureEnablementStatus, facet.id)) {
                facet.isAvailable = featureEnablementStatus[facet.id];
            }
            return facet.isAvailable;
        });
    }
    getSuggestions(inputInfo) {
        let suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm } = inputInfo.searchQuery;
            const { settings } = this;
            const activeFacetIds = this.getActiveFacetIds(inputInfo);
            const hasActiveFacets = !!activeFacetIds.size;
            if (hasSearchTerm || hasActiveFacets) {
                const { limit } = settings;
                const { app: { vault }, } = this;
                // initialize options
                const options = {
                    headings: settings.shouldSearchHeadings,
                    allHeadings: settings.searchAllHeadings,
                    aliases: settings.shouldShowAlias,
                    bookmarks: settings.shouldSearchBookmarks,
                    filename: settings.shouldSearchFilenames,
                    filenameAsFallback: !settings.strictHeadingsOnly,
                    unresolved: !settings.showExistingOnly,
                };
                this.getItems([vault.getRoot()], inputInfo, suggestions, activeFacetIds, options);
                obsidian.sortSearchResults(suggestions);
                if (limit > 0 && suggestions.length > limit) {
                    suggestions = suggestions.slice(0, limit);
                }
            }
            else {
                this.getSuggestionsForEditorsAndRecentFiles(inputInfo, suggestions, new Set(), { editors: true, recentFiles: settings.shouldSearchRecentFiles });
            }
        }
        return suggestions;
    }
    getItems(files, inputInfo, collection, activeFacetIds, options) {
        const hasActiveFacets = !!activeFacetIds.size;
        // Editors and recent files should only be displayed when there's no search term, or when
        // it's faceted with recentFiles
        const editorAndRecentOptions = { editors: false, recentFiles: false };
        this.getSuggestionsForEditorsAndRecentFiles(inputInfo, collection, activeFacetIds, editorAndRecentOptions);
        // Use the bookmark enabled state to determine whether or not to include them
        const bookmarkOptions = {
            fileBookmarks: options.bookmarks,
            nonFileBookmarks: options.bookmarks,
        };
        this.getSuggestionsForBookmarks(inputInfo, collection, activeFacetIds, bookmarkOptions);
        // Set up options for processing the collections of files
        const fileOptions = {
            headings: options.headings,
            allHeadings: options.allHeadings,
            aliases: options.aliases,
            filename: options.filename,
            filenameAsFallback: options.filenameAsFallback,
        };
        this.getSuggestionForFiles(inputInfo, files, collection, activeFacetIds, fileOptions);
        // Since there's no facet for unresolved, they should never show up when
        // facets are active.
        if (options.unresolved && !hasActiveFacets) {
            this.addUnresolvedSuggestions(collection, inputInfo.searchQuery.prepQuery);
        }
    }
    getSuggestionsForBookmarks(inputInfo, collection, activeFacetIds, options) {
        const hasActiveFacets = activeFacetIds.size;
        const { prepQuery } = inputInfo.searchQuery;
        const { fileBookmarks, nonFileBookmarks } = inputInfo.currentWorkspaceEnvList;
        if (hasActiveFacets) {
            const isBookmarkFacetEnabled = activeFacetIds.has(HeadingsListFacetIds.Bookmarks);
            options = Object.assign(options, {
                fileBookmarks: isBookmarkFacetEnabled,
                nonFileBookmarks: isBookmarkFacetEnabled,
            });
        }
        const processBookmarks = (bookmarkInfoList) => {
            for (const bookmarkInfo of bookmarkInfoList) {
                this.addBookmarkSuggestion(inputInfo, collection, prepQuery, bookmarkInfo);
            }
        };
        if (options.fileBookmarks) {
            fileBookmarks.forEach((bookmarkInfoList) => {
                processBookmarks(bookmarkInfoList);
            });
        }
        if (options.nonFileBookmarks) {
            processBookmarks(nonFileBookmarks);
        }
    }
    getSuggestionForFiles(inputInfo, files, collection, activeFacetIds, options) {
        const hasActiveFacets = !!activeFacetIds.size;
        if (hasActiveFacets) {
            const isHeadingsEnabled = this.isFacetedWith(activeFacetIds, HeadingsListFacetIds.Headings);
            const isExternalFilesEnabled = this.isFacetedWith(activeFacetIds, HeadingsListFacetIds.ExternalFiles);
            // Enable filename when external files facet is active, or, when the Filename
            // facet is active
            const isFilenameEnabled = isExternalFilesEnabled ||
                this.isFacetedWith(activeFacetIds, HeadingsListFacetIds.Filenames);
            let allHeadings = false;
            let filenameAsFallback = false;
            if (isHeadingsEnabled) {
                allHeadings = options.allHeadings === true;
                filenameAsFallback = options.filenameAsFallback === true;
            }
            options = Object.assign(options, {
                headings: isHeadingsEnabled,
                aliases: false,
                filename: isFilenameEnabled,
                allHeadings,
                filenameAsFallback,
            });
        }
        else {
            options = Object.assign({
                headings: true,
                allHeadings: true,
                aliases: true,
                filename: true,
                filenameAsFallback: true,
            }, options);
        }
        // If any of these options are true then every file needs to be processed.
        const shouldProcessFiles = [options.headings, options.aliases, options.filename].some((option) => option === true);
        if (shouldProcessFiles) {
            const { prepQuery } = inputInfo.searchQuery;
            const { excludeFolders } = this.settings;
            const isExcludedFolder = matcherFnForRegExList(excludeFolders);
            let nodes = Array.prototype.concat(files);
            while (nodes.length > 0) {
                const node = nodes.pop();
                if (isTFile(node)) {
                    if (this.shouldIncludeFile(node, activeFacetIds)) {
                        this.addSuggestionsForFile(inputInfo, collection, node, prepQuery, options);
                    }
                }
                else if (!isExcludedFolder(node.path)) {
                    nodes = nodes.concat(node.children);
                }
            }
        }
    }
    addSuggestionsForFile(inputInfo, suggestions, file, prepQuery, options) {
        let isH1Matched = false;
        if (options.headings) {
            isH1Matched = this.addHeadingSuggestions(inputInfo, suggestions, prepQuery, file, options.allHeadings);
        }
        if (options.filename || (!isH1Matched && options.filenameAsFallback)) {
            this.addFileSuggestions(inputInfo, suggestions, prepQuery, file);
        }
        if (options.aliases) {
            this.addAliasSuggestions(inputInfo, suggestions, prepQuery, file);
        }
    }
    shouldIncludeFile(file, activeFacetIds = new Set()) {
        let isIncluded = false;
        if (file) {
            const coreFileExtensions = new Set(['md', 'canvas']);
            const { extension } = file;
            const { app: { viewRegistry, metadataCache }, settings: { excludeObsidianIgnoredFiles, fileExtAllowList, builtInSystemOptions: { showAttachments, showAllFileTypes }, }, } = this;
            const isUserIgnored = excludeObsidianIgnoredFiles && metadataCache.isUserIgnored(file.path);
            if (!isUserIgnored) {
                if (activeFacetIds.has(HeadingsListFacetIds.ExternalFiles)) {
                    const externalFilesEnabled = showAttachments || showAllFileTypes;
                    isIncluded = !coreFileExtensions.has(extension) && externalFilesEnabled;
                }
                else {
                    const isExtAllowed = this.isExternalFileTypeAllowed(file, viewRegistry, showAttachments, showAllFileTypes, fileExtAllowList);
                    isIncluded = isExtAllowed || coreFileExtensions.has(extension);
                }
            }
        }
        return isIncluded;
    }
    isExternalFileTypeAllowed(file, viewRegistry, showAttachments, showAllFileTypes, fileExtAllowList) {
        const { extension } = file;
        let isAllowed = viewRegistry.isExtensionRegistered(extension)
            ? showAttachments
            : showAllFileTypes;
        if (!isAllowed) {
            const allowList = new Set(fileExtAllowList);
            isAllowed = allowList.has(extension);
        }
        return isAllowed;
    }
    addAliasSuggestions(inputInfo, suggestions, prepQuery, file) {
        const { metadataCache } = this.app;
        const frontMatter = metadataCache.getFileCache(file)?.frontmatter;
        if (frontMatter) {
            const aliases = FrontMatterParser.getAliases(frontMatter);
            let i = aliases.length;
            // create suggestions where there is a match with an alias
            while (i--) {
                const alias = aliases[i];
                const { match } = this.fuzzySearchWithFallback(prepQuery, alias);
                if (match) {
                    suggestions.push(this.createAliasSuggestion(inputInfo, alias, file, match));
                }
            }
        }
    }
    addFileSuggestions(inputInfo, suggestions, prepQuery, file) {
        const { match, matchType, matchText } = this.fuzzySearchWithFallback(prepQuery, null, file);
        if (match) {
            suggestions.push(this.createFileSuggestion(inputInfo, file, match, matchType, matchText));
        }
    }
    addBookmarkSuggestion(inputInfo, suggestions, prepQuery, bookmarkInfo) {
        const result = this.fuzzySearchWithFallback(prepQuery, bookmarkInfo.bookmarkPath);
        if (result.match) {
            const sugg = BookmarksHandler.createSuggestion(inputInfo.currentWorkspaceEnvList, bookmarkInfo, this.settings, this.app.metadataCache, result);
            suggestions.push(sugg);
        }
    }
    addHeadingSuggestions(inputInfo, suggestions, prepQuery, file, allHeadings) {
        const { metadataCache } = this.app;
        const headingList = metadataCache.getFileCache(file)?.headings ?? [];
        let h1 = null;
        let isH1Matched = false;
        let i = headingList.length;
        while (i--) {
            const heading = headingList[i];
            let isMatched = false;
            if (allHeadings) {
                isMatched = this.matchAndPushHeading(inputInfo, suggestions, prepQuery, file, heading);
            }
            if (heading.level === 1) {
                const { line } = heading.position.start;
                if (h1 === null || line < h1.position.start.line) {
                    h1 = heading;
                    isH1Matched = isMatched;
                }
            }
        }
        if (!allHeadings && h1) {
            isH1Matched = this.matchAndPushHeading(inputInfo, suggestions, prepQuery, file, h1);
        }
        return isH1Matched;
    }
    matchAndPushHeading(inputInfo, suggestions, prepQuery, file, heading) {
        const { match } = this.fuzzySearchWithFallback(prepQuery, heading.heading);
        if (match) {
            suggestions.push(this.createHeadingSuggestion(inputInfo, heading, file, match));
        }
        return !!match;
    }
    addUnresolvedSuggestions(suggestions, prepQuery) {
        const { metadataCache } = this.app;
        const { unresolvedLinks } = metadataCache;
        const unresolvedSet = new Set();
        const sources = Object.keys(unresolvedLinks);
        let i = sources.length;
        // create a distinct list of unresolved links
        while (i--) {
            // each source has an object with keys that represent the list of unresolved links
            // for that source file
            const sourcePath = sources[i];
            const links = Object.keys(unresolvedLinks[sourcePath]);
            let j = links.length;
            while (j--) {
                // unresolved links can be duplicates, use a Set to get a distinct list
                unresolvedSet.add(links[j]);
            }
        }
        const unresolvedList = Array.from(unresolvedSet);
        i = unresolvedList.length;
        // create suggestions where there is a match with an unresolved link
        while (i--) {
            const unresolved = unresolvedList[i];
            const result = this.fuzzySearchWithFallback(prepQuery, unresolved);
            if (result.matchType !== MatchType.None) {
                suggestions.push(StandardExHandler.createUnresolvedSuggestion(unresolved, result, this.settings, metadataCache));
            }
        }
    }
    createAliasSuggestion(inputInfo, alias, file, match) {
        let sugg = {
            alias,
            file,
            ...this.createSearchMatch(match, MatchType.Primary, alias),
            type: SuggestionType.Alias,
        };
        sugg = Handler.updateWorkspaceEnvListStatus(inputInfo.currentWorkspaceEnvList, sugg);
        return this.applyMatchPriorityPreferences(sugg);
    }
    createFileSuggestion(inputInfo, file, match, matchType, matchText) {
        let sugg = {
            file,
            match,
            matchType,
            matchText,
            type: SuggestionType.File,
        };
        sugg = Handler.updateWorkspaceEnvListStatus(inputInfo.currentWorkspaceEnvList, sugg);
        return this.applyMatchPriorityPreferences(sugg);
    }
    createHeadingSuggestion(inputInfo, item, file, match) {
        let sugg = {
            item,
            file,
            ...this.createSearchMatch(match, MatchType.Primary, item.heading),
            type: SuggestionType.HeadingsList,
        };
        sugg = Handler.updateWorkspaceEnvListStatus(inputInfo.currentWorkspaceEnvList, sugg);
        return this.applyMatchPriorityPreferences(sugg);
    }
    createSearchMatch(match, type, text) {
        let matchType = MatchType.None;
        let matchText = null;
        if (match) {
            matchType = type;
            matchText = text;
        }
        return {
            match,
            matchType,
            matchText,
        };
    }
    addRecentFilesSuggestions(file, inputInfo, prepQuery, collection) {
        const h1 = this.getFirstH1(file);
        const { match, matchType, matchText } = this.fuzzySearchWithFallback(prepQuery, h1?.heading, file);
        if (match) {
            let sugg;
            if (matchType === MatchType.Primary) {
                sugg = this.createHeadingSuggestion(inputInfo, h1, file, match);
            }
            else {
                sugg = this.createFileSuggestion(inputInfo, file, match, matchType, matchText);
            }
            collection.push(sugg);
        }
    }
    addOpenEditorSuggestions(leaf, inputInfo, prepQuery, collection) {
        const file = leaf?.view?.file;
        const { settings, app: { metadataCache }, } = this;
        const preferredTitle = EditorHandler.getPreferredTitle(leaf, settings.preferredSourceForTitle, metadataCache);
        const result = this.fuzzySearchWithFallback(prepQuery, preferredTitle, file);
        if (result.match) {
            const sugg = EditorHandler.createSuggestion(inputInfo.currentWorkspaceEnvList, leaf, file, settings, metadataCache, preferredTitle, result);
            collection.push(sugg);
        }
    }
    getSuggestionsForEditorsAndRecentFiles(inputInfo, collection, activeFacetIds, options) {
        const prepQuery = inputInfo.searchQuery?.prepQuery;
        if (activeFacetIds.has(HeadingsListFacetIds.RecentFiles)) {
            options = Object.assign(options, { editors: false, recentFiles: true });
        }
        else {
            options = Object.assign({ editors: true, recentFiles: true }, options);
        }
        if (options.editors) {
            const leaves = inputInfo.currentWorkspaceEnvList?.openWorkspaceLeaves;
            leaves?.forEach((leaf) => {
                this.addOpenEditorSuggestions(leaf, inputInfo, prepQuery, collection);
            });
        }
        if (options.recentFiles) {
            const files = inputInfo.currentWorkspaceEnvList?.mostRecentFiles;
            files?.forEach((file) => {
                if (this.shouldIncludeFile(file, activeFacetIds)) {
                    this.addRecentFilesSuggestions(file, inputInfo, prepQuery, collection);
                }
            });
        }
    }
    onNoResultsCreateAction(inputInfo, evt) {
        const filename = inputInfo.parsedCommand(Mode.HeadingsList)?.parsedInput;
        this.createFile(filename, evt);
        return true;
    }
}

const CANVAS_ICON_MAP = {
    file: 'lucide-file-text',
    text: 'lucide-sticky-note',
    link: 'lucide-globe',
    group: 'create-group',
};
class SymbolHandler extends Handler {
    getCommandString(sessionOpts) {
        const { settings } = this;
        return sessionOpts?.useActiveEditorAsSource
            ? settings.symbolListActiveEditorCommand
            : settings.symbolListCommand;
    }
    validateCommand(inputInfo, index, filterText, activeSuggestion, activeLeaf) {
        const cmd = inputInfo.parsedCommand(Mode.SymbolList);
        const sourceInfo = this.getSourceInfoForSymbolOperation(activeSuggestion, activeLeaf, index === 0, inputInfo.sessionOpts);
        if (sourceInfo) {
            inputInfo.mode = Mode.SymbolList;
            cmd.source = sourceInfo;
            cmd.index = index;
            cmd.parsedInput = filterText;
            cmd.isValidated = true;
        }
        return cmd;
    }
    async getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            this.inputInfo = inputInfo;
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const symbolCmd = inputInfo.parsedCommand(Mode.SymbolList);
            const items = await this.getItems(symbolCmd.source, hasSearchTerm);
            items.forEach((item) => {
                let shouldPush = true;
                let match = null;
                if (hasSearchTerm) {
                    match = obsidian.fuzzySearch(prepQuery, SymbolHandler.getSuggestionTextForSymbol(item));
                    shouldPush = !!match;
                }
                if (shouldPush) {
                    const { file } = symbolCmd.source;
                    suggestions.push({ type: SuggestionType.SymbolList, file, item, match });
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { item } = sugg;
            const parentElClasses = ['qsp-suggestion-symbol'];
            if (Object.prototype.hasOwnProperty.call(item, 'indentLevel') &&
                this.settings.symbolsInLineOrder &&
                !this.inputInfo?.searchQuery?.hasSearchTerm) {
                parentElClasses.push(`qsp-symbol-l${item.indentLevel}`);
            }
            this.addClassesToSuggestionContainer(parentEl, parentElClasses);
            const text = SymbolHandler.getSuggestionTextForSymbol(item);
            this.renderContent(parentEl, text, sugg.match);
            this.addSymbolIndicator(item, parentEl);
            handled = true;
        }
        return handled;
    }
    onChooseSuggestion(sugg, evt) {
        let handled = false;
        if (sugg) {
            const symbolCmd = this.inputInfo.parsedCommand();
            const { leaf, file } = symbolCmd.source;
            const openState = { active: true };
            const { item } = sugg;
            if (item.symbolType !== SymbolType.CanvasNode) {
                openState.eState = this.constructMDFileNavigationState(item).eState;
            }
            this.navigateToLeafOrOpenFileAsync(evt, file, openState, leaf, Mode.SymbolList).then(() => {
                const { symbol } = item;
                if (SymbolHandler.isCanvasSymbolPayload(item, symbol)) {
                    this.zoomToCanvasNode(this.getActiveLeaf().view, symbol);
                }
            }, (reason) => {
                console.log(`Switcher++: Unable to navigate to symbols for file ${file.path}`, reason);
            });
            handled = true;
        }
        return handled;
    }
    reset() {
        this.inputInfo = null;
    }
    getAvailableFacets(inputInfo) {
        const cmd = inputInfo.parsedCommand(Mode.SymbolList);
        const isCanvasFile = SymbolHandler.isCanvasFile(cmd?.source?.file);
        const facets = this.getFacets(inputInfo.mode);
        const canvasFacetIds = new Set(Object.values(CANVAS_NODE_FACET_ID_MAP));
        // get only the string values of SymbolType as they are used as the face ids
        const mdFacetIds = new Set(Object.values(SymbolType).filter((v) => isNaN(Number(v))));
        facets.forEach((facet) => {
            const { id } = facet;
            facet.isAvailable = isCanvasFile ? canvasFacetIds.has(id) : mdFacetIds.has(id);
        });
        return facets.filter((v) => v.isAvailable);
    }
    zoomToCanvasNode(view, nodeData) {
        if (SymbolHandler.isCanvasView(view)) {
            const canvas = view.canvas;
            const node = canvas.nodes.get(nodeData.id);
            canvas.selectOnly(node);
            canvas.zoomToSelection();
        }
    }
    constructMDFileNavigationState(symbolInfo) {
        const { start: { line, col }, end: endLoc, } = symbolInfo.symbol.position;
        // object containing the state information for the target editor,
        // start with the range to highlight in target editor
        return {
            eState: {
                active: true,
                focus: true,
                startLoc: { line, col },
                endLoc,
                line,
                cursor: {
                    from: { line, ch: col },
                    to: { line, ch: col },
                },
            },
        };
    }
    getSourceInfoForSymbolOperation(activeSuggestion, activeLeaf, isSymbolCmdPrefix, sessionOpts) {
        const prevInputInfo = this.inputInfo;
        let prevSourceInfo = null;
        let prevMode = Mode.Standard;
        if (prevInputInfo) {
            prevSourceInfo = prevInputInfo.parsedCommand().source;
            prevMode = prevInputInfo.mode;
        }
        // figure out if the previous operation was a symbol operation
        const hasPrevSymbolSource = prevMode === Mode.SymbolList && !!prevSourceInfo;
        const activeEditorInfo = this.getEditorInfo(activeLeaf);
        const activeSuggInfo = this.getSuggestionInfo(activeSuggestion);
        // Pick the source file for a potential symbol operation, prioritizing
        // any pre-existing symbol operation that was in progress
        let sourceInfo = null;
        if (hasPrevSymbolSource) {
            sourceInfo = prevSourceInfo;
        }
        else if (activeSuggInfo.isValidSource && !sessionOpts.useActiveEditorAsSource) {
            sourceInfo = activeSuggInfo;
        }
        else if (activeEditorInfo.isValidSource && isSymbolCmdPrefix) {
            // Check isSymbolCmdPrefix to prevent the case where an embedded command would
            // trigger this mode for the active editor.
            sourceInfo = activeEditorInfo;
        }
        return sourceInfo;
    }
    async getItems(sourceInfo, hasSearchTerm) {
        let items = [];
        let symbolsInLineOrder = false;
        let selectNearestHeading = false;
        if (!hasSearchTerm) {
            ({ selectNearestHeading, symbolsInLineOrder } = this.settings);
        }
        items = await this.getSymbolsFromSource(sourceInfo, symbolsInLineOrder);
        if (selectNearestHeading) {
            SymbolHandler.FindNearestHeadingSymbol(items, sourceInfo);
        }
        return items;
    }
    static FindNearestHeadingSymbol(items, sourceInfo) {
        const cursorLine = sourceInfo?.cursor?.line;
        // find the nearest heading to the current cursor pos, if applicable
        if (cursorLine) {
            let found = null;
            const headings = items.filter((v) => isHeadingCache(v.symbol));
            if (headings.length) {
                found = headings.reduce((acc, curr) => {
                    const { line: currLine } = curr.symbol.position.start;
                    const accLine = acc ? acc.symbol.position.start.line : -1;
                    return currLine > accLine && currLine <= cursorLine ? curr : acc;
                });
            }
            if (found) {
                found.isSelected = true;
            }
        }
    }
    async getSymbolsFromSource(sourceInfo, orderByLineNumber) {
        const { app: { metadataCache }, inputInfo, } = this;
        const ret = [];
        if (sourceInfo?.file) {
            const { file } = sourceInfo;
            const activeFacetIds = this.getActiveFacetIds(inputInfo);
            if (SymbolHandler.isCanvasFile(file)) {
                await this.addCanvasSymbolsFromSource(file, ret, activeFacetIds);
            }
            else {
                const symbolData = metadataCache.getFileCache(file);
                if (symbolData) {
                    const push = (symbols = [], symbolType) => {
                        if (this.shouldIncludeSymbol(symbolType, activeFacetIds)) {
                            symbols.forEach((symbol) => ret.push({ type: 'symbolInfo', symbol, symbolType }));
                        }
                    };
                    push(symbolData.headings, SymbolType.Heading);
                    push(symbolData.tags, SymbolType.Tag);
                    this.addLinksFromSource(symbolData.links, ret, activeFacetIds);
                    push(symbolData.embeds, SymbolType.Embed);
                    await this.addCalloutsFromSource(file, symbolData.sections?.filter((v) => v.type === 'callout'), ret, activeFacetIds);
                    if (orderByLineNumber) {
                        SymbolHandler.orderSymbolsByLineNumber(ret);
                    }
                }
            }
        }
        return ret;
    }
    shouldIncludeSymbol(symbolType, activeFacetIds) {
        let shouldInclude = false;
        if (typeof symbolType === 'string') {
            shouldInclude = this.isFacetedWith(activeFacetIds, symbolType);
        }
        else {
            shouldInclude =
                this.settings.isSymbolTypeEnabled(symbolType) &&
                    this.isFacetedWith(activeFacetIds, SymbolType[symbolType]);
        }
        return shouldInclude;
    }
    async addCanvasSymbolsFromSource(file, symbolList, activeFacetIds) {
        let canvasNodes;
        try {
            const fileContent = await this.app.vault.cachedRead(file);
            canvasNodes = JSON.parse(fileContent).nodes;
        }
        catch (e) {
            console.log(`Switcher++: error reading file to extract canvas node information. ${file.path} `, e);
        }
        if (Array.isArray(canvasNodes)) {
            canvasNodes.forEach((node) => {
                if (this.shouldIncludeSymbol(CANVAS_NODE_FACET_ID_MAP[node.type], activeFacetIds)) {
                    symbolList.push({
                        type: 'symbolInfo',
                        symbolType: SymbolType.CanvasNode,
                        symbol: { ...node },
                    });
                }
            });
        }
    }
    async addCalloutsFromSource(file, sectionCache, symbolList, activeFacetIds) {
        const { app: { vault }, } = this;
        const shouldInclude = this.shouldIncludeSymbol(SymbolType.Callout, activeFacetIds);
        if (shouldInclude && sectionCache?.length && file) {
            let fileContent = null;
            try {
                fileContent = await vault.cachedRead(file);
            }
            catch (e) {
                console.log(`Switcher++: error reading file to extract callout information. ${file.path} `, e);
            }
            if (fileContent) {
                for (const cache of sectionCache) {
                    const { start, end } = cache.position;
                    const calloutStr = fileContent.slice(start.offset, end.offset);
                    const match = calloutStr.match(/^> \[!([^\]]+)\][+-]?(.*?)(?:\n>|$)/);
                    if (match) {
                        const calloutType = match[1];
                        const calloutTitle = match[match.length - 1];
                        const symbol = {
                            calloutTitle: calloutTitle.trim(),
                            calloutType,
                            ...cache,
                        };
                        symbolList.push({
                            type: 'symbolInfo',
                            symbolType: SymbolType.Callout,
                            symbol,
                        });
                    }
                }
            }
        }
    }
    addLinksFromSource(linkData, symbolList, activeFacetIds) {
        const { settings } = this;
        linkData = linkData ?? [];
        if (this.shouldIncludeSymbol(SymbolType.Link, activeFacetIds)) {
            for (const link of linkData) {
                const type = getLinkType(link);
                const isExcluded = (settings.excludeLinkSubTypes & type) === type;
                if (!isExcluded) {
                    symbolList.push({
                        type: 'symbolInfo',
                        symbol: link,
                        symbolType: SymbolType.Link,
                    });
                }
            }
        }
    }
    static orderSymbolsByLineNumber(symbols) {
        const sorted = symbols.sort((a, b) => {
            const { start: aStart } = a.symbol.position;
            const { start: bStart } = b.symbol.position;
            const lineDiff = aStart.line - bStart.line;
            return lineDiff === 0 ? aStart.col - bStart.col : lineDiff;
        });
        let currIndentLevel = 0;
        sorted.forEach((si) => {
            let indentLevel = 0;
            if (isHeadingCache(si.symbol)) {
                currIndentLevel = si.symbol.level;
                indentLevel = si.symbol.level - 1;
            }
            else {
                indentLevel = currIndentLevel;
            }
            si.indentLevel = indentLevel;
        });
        return sorted;
    }
    static getSuggestionTextForSymbol(symbolInfo) {
        const { symbol } = symbolInfo;
        let text;
        if (isHeadingCache(symbol)) {
            text = symbol.heading;
        }
        else if (isTagCache(symbol)) {
            text = symbol.tag.slice(1);
        }
        else if (isCalloutCache(symbol)) {
            text = symbol.calloutTitle;
        }
        else if (SymbolHandler.isCanvasSymbolPayload(symbolInfo, symbol)) {
            text = SymbolHandler.getSuggestionTextForCanvasNode(symbol);
        }
        else {
            const refCache = symbol;
            ({ link: text } = refCache);
            const { displayText } = refCache;
            if (displayText && displayText !== text) {
                text += `|${displayText}`;
            }
        }
        return text;
    }
    static getSuggestionTextForCanvasNode(node) {
        let text = '';
        const accessors = {
            file: () => node.file,
            text: () => node.text,
            link: () => node.url,
            group: () => node.label,
        };
        const fn = accessors[node?.type];
        if (fn) {
            text = fn();
        }
        return text;
    }
    addSymbolIndicator(symbolInfo, parentEl) {
        const { symbolType, symbol } = symbolInfo;
        const flairElClasses = ['qsp-symbol-indicator'];
        const flairContainerEl = this.createFlairContainer(parentEl);
        if (isCalloutCache(symbol)) {
            flairElClasses.push(...['suggestion-flair', 'callout', 'callout-icon', 'svg-icon']);
            const calloutFlairEl = flairContainerEl.createSpan({
                cls: flairElClasses,
                // Obsidian 0.15.9: the icon glyph is set in css based on the data-callout attr
                attr: { 'data-callout': symbol.calloutType },
            });
            // Obsidian 0.15.9 the --callout-icon css prop holds the name of the icon glyph
            const iconName = calloutFlairEl.getCssPropertyValue('--callout-icon');
            obsidian.setIcon(calloutFlairEl, iconName);
        }
        else if (SymbolHandler.isCanvasSymbolPayload(symbolInfo, symbol)) {
            const icon = CANVAS_ICON_MAP[symbol.type];
            this.renderIndicator(flairContainerEl, flairElClasses, icon, null);
        }
        else {
            let indicator;
            if (isHeadingCache(symbol)) {
                indicator = HeadingIndicators[symbol.level];
            }
            else {
                indicator = SymbolIndicators[symbolType];
            }
            this.renderIndicator(flairContainerEl, flairElClasses, null, indicator);
        }
    }
    static isCanvasSymbolPayload(symbolInfo, payload) {
        return symbolInfo.symbolType === SymbolType.CanvasNode;
    }
    static isCanvasFile(sourceFile) {
        return sourceFile?.extension === 'canvas';
    }
    static isCanvasView(view) {
        return view?.getViewType() === 'canvas';
    }
}

const COMMAND_PALETTE_PLUGIN_ID = 'command-palette';
const RECENTLY_USED_COMMAND_IDS = [];
class CommandHandler extends Handler {
    getCommandString(_sessionOpts) {
        return this.settings?.commandListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        const cmd = inputInfo.parsedCommand(Mode.CommandList);
        if (this.getEnabledCommandPalettePluginInstance()) {
            inputInfo.mode = Mode.CommandList;
            cmd.index = index;
            cmd.parsedInput = filterText;
            cmd.isValidated = true;
        }
        return cmd;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const itemsInfo = this.getItems(inputInfo, hasSearchTerm);
            itemsInfo.forEach((info) => {
                let shouldPush = true;
                let match = null;
                if (hasSearchTerm) {
                    match = obsidian.fuzzySearch(prepQuery, info.cmd.name);
                    shouldPush = !!match;
                }
                if (shouldPush) {
                    suggestions.push(this.createSuggestion(info, match));
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { item, match, isPinned, isRecent } = sugg;
            this.addClassesToSuggestionContainer(parentEl, ['qsp-suggestion-command']);
            this.renderContent(parentEl, item.name, match);
            const flairContainerEl = this.createFlairContainer(parentEl);
            this.renderHotkeyForCommand(item.id, this.app, flairContainerEl);
            if (item.icon) {
                this.renderIndicator(flairContainerEl, [], item.icon);
            }
            if (isPinned) {
                this.renderIndicator(flairContainerEl, [], 'filled-pin');
            }
            else if (isRecent) {
                this.renderOptionalIndicators(parentEl, sugg, flairContainerEl);
            }
            handled = true;
        }
        return handled;
    }
    renderHotkeyForCommand(id, app, flairContainerEl) {
        try {
            const { hotkeyManager } = app;
            if (hotkeyManager.getHotkeys(id) || hotkeyManager.getDefaultHotkeys(id)) {
                const hotkeyStr = hotkeyManager.printHotkeyForCommand(id);
                if (hotkeyStr?.length) {
                    flairContainerEl.createEl('kbd', {
                        cls: 'suggestion-hotkey',
                        text: hotkeyStr,
                    });
                }
            }
        }
        catch (err) {
            console.log('Switcher++: error rendering hotkey for command id: ', id, err);
        }
    }
    onChooseSuggestion(sugg) {
        let handled = false;
        if (sugg) {
            const { item } = sugg;
            this.app.commands.executeCommandById(item.id);
            this.saveUsageToList(item.id, RECENTLY_USED_COMMAND_IDS);
            handled = true;
        }
        return handled;
    }
    saveUsageToList(commandId, recentCommandIds) {
        if (recentCommandIds) {
            const oldIndex = recentCommandIds.indexOf(commandId);
            if (oldIndex > -1) {
                recentCommandIds.splice(oldIndex, 1);
            }
            recentCommandIds.unshift(commandId);
            recentCommandIds.splice(25);
        }
    }
    getItems(inputInfo, includeAllCommands) {
        let items = [];
        const activeFacetIds = this.getActiveFacetIds(inputInfo);
        const hasActiveFacets = !!activeFacetIds.size;
        if (hasActiveFacets) {
            items = this.getPinnedAndRecentCommands(activeFacetIds);
        }
        else if (includeAllCommands) {
            items = this.getAllCommands();
        }
        else {
            const pinnedAndRecents = this.getPinnedAndRecentCommands(activeFacetIds);
            items = pinnedAndRecents.length ? pinnedAndRecents : this.getAllCommands();
        }
        return items;
    }
    getPinnedAndRecentCommands(activeFacetIds) {
        const items = [];
        const pinnedIdsSet = this.getPinnedCommandIds();
        const recentIdsSet = this.getRecentCommandIds();
        const findCommandInfo = (id) => {
            let cmdInfo = null;
            const cmd = this.app.commands.findCommand(id);
            if (cmd) {
                cmdInfo = {
                    isPinned: pinnedIdsSet.has(id),
                    isRecent: recentIdsSet.has(id),
                    cmd,
                };
            }
            return cmdInfo;
        };
        const addCommandInfo = (facetId, cmdIds) => {
            if (this.isFacetedWith(activeFacetIds, facetId)) {
                cmdIds.forEach((id) => {
                    const cmdInfo = findCommandInfo(id);
                    if (cmdInfo) {
                        items.push(cmdInfo);
                    }
                });
            }
        };
        addCommandInfo(CommandListFacetIds.Pinned, Array.from(pinnedIdsSet));
        const isPinnedFaceted = this.isFacetedWith(activeFacetIds, CommandListFacetIds.Pinned);
        // Remove any recently used ids that are also in the pinned list so they don't
        // appear twice in the result list when the pinned facet is enabled
        const recentIds = Array.from(recentIdsSet).filter(
        // When not pinned faceted then the recent item should be in the result list
        // but when it is pinned facted, the recent item should only be in the result list
        // when it does not already exist in the pinned list
        (id) => !isPinnedFaceted || (isPinnedFaceted && !pinnedIdsSet.has(id)));
        addCommandInfo(CommandListFacetIds.Recent, recentIds);
        return items;
    }
    getAllCommands() {
        const pinnedIdsSet = this.getPinnedCommandIds();
        const recentIdsSet = this.getRecentCommandIds();
        return this.app.commands
            .listCommands()
            ?.sort((a, b) => a.name.localeCompare(b.name))
            .map((cmd) => {
            return {
                isPinned: pinnedIdsSet.has(cmd.id),
                isRecent: recentIdsSet.has(cmd.id),
                cmd,
            };
        });
    }
    getPinnedCommandIds() {
        const ids = this.getEnabledCommandPalettePluginInstance()?.options?.pinned;
        return new Set(ids ?? []);
    }
    getRecentCommandIds() {
        return new Set(RECENTLY_USED_COMMAND_IDS);
    }
    createSuggestion(commandInfo, match) {
        const { cmd, isPinned, isRecent } = commandInfo;
        const sugg = {
            type: SuggestionType.CommandList,
            item: cmd,
            isPinned,
            isRecent,
            match,
        };
        return this.applyMatchPriorityPreferences(sugg);
    }
    getEnabledCommandPalettePluginInstance() {
        return getInternalEnabledPluginById(this.app, COMMAND_PALETTE_PLUGIN_ID);
    }
}

class RelatedItemsHandler extends Handler {
    getCommandString(sessionOpts) {
        const { settings } = this;
        return sessionOpts?.useActiveEditorAsSource
            ? settings.relatedItemsListActiveEditorCommand
            : settings.relatedItemsListCommand;
    }
    validateCommand(inputInfo, index, filterText, activeSuggestion, activeLeaf) {
        const cmd = inputInfo.parsedCommand(Mode.RelatedItemsList);
        const sourceInfo = this.getSourceInfo(activeSuggestion, activeLeaf, index === 0, inputInfo.sessionOpts);
        if (sourceInfo) {
            inputInfo.mode = Mode.RelatedItemsList;
            cmd.source = sourceInfo;
            cmd.index = index;
            cmd.parsedInput = filterText;
            cmd.isValidated = true;
        }
        return cmd;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            this.inputInfo = inputInfo;
            inputInfo.buildSearchQuery();
            const { hasSearchTerm } = inputInfo.searchQuery;
            const cmd = inputInfo.parsedCommand(Mode.RelatedItemsList);
            const items = this.getItems(cmd.source, inputInfo);
            items.forEach((item) => {
                const sugg = this.searchAndCreateSuggestion(inputInfo, item);
                if (sugg) {
                    suggestions.push(sugg);
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            const { file, matchType, match, item } = sugg;
            const iconMap = new Map([
                [RelationType.Backlink, 'links-coming-in'],
                [RelationType.DiskLocation, 'folder-tree'],
                [RelationType.OutgoingLink, 'links-going-out'],
            ]);
            parentEl.setAttribute('data-relation-type', item.relationType);
            this.renderAsFileInfoPanel(parentEl, ['qsp-suggestion-related'], sugg.preferredTitle, file, matchType, match);
            const flairContainerEl = this.renderOptionalIndicators(parentEl, sugg);
            if (sugg.item.count) {
                // show the count of backlinks
                this.renderIndicator(flairContainerEl, [], null, `${sugg.item.count}`);
            }
            // render the flair icon
            this.renderIndicator(flairContainerEl, ['qsp-related-indicator'], iconMap.get(item.relationType));
            handled = true;
        }
        return handled;
    }
    onChooseSuggestion(sugg, evt) {
        let handled = false;
        if (sugg) {
            const { file } = sugg;
            this.navigateToLeafOrOpenFile(evt, file, `Unable to open related file ${file.path}`);
            handled = true;
        }
        return handled;
    }
    getPreferredTitle(item, preferredSource) {
        let text = null;
        const { file, unresolvedText } = item;
        if (file) {
            if (preferredSource === 'H1') {
                text = this.getFirstH1(file)?.heading ?? null;
            }
        }
        else {
            const isUnresolved = !!unresolvedText?.length;
            if (isUnresolved) {
                text = unresolvedText;
            }
        }
        return text;
    }
    searchAndCreateSuggestion(inputInfo, item) {
        const { file, unresolvedText } = item;
        let result = { matchType: MatchType.None, match: null };
        const isUnresolved = file === null && unresolvedText?.length;
        const { currentWorkspaceEnvList, searchQuery: { hasSearchTerm, prepQuery }, } = inputInfo;
        const { settings, app: { metadataCache }, } = this;
        const preferredTitle = this.getPreferredTitle(item, settings.preferredSourceForTitle);
        if (hasSearchTerm) {
            result = this.fuzzySearchWithFallback(prepQuery, preferredTitle, file);
            if (result.matchType === MatchType.None) {
                return null;
            }
        }
        return isUnresolved
            ? StandardExHandler.createUnresolvedSuggestion(preferredTitle, result, settings, metadataCache)
            : this.createSuggestion(currentWorkspaceEnvList, item, result, preferredTitle);
    }
    getItems(sourceInfo, inputInfo) {
        const relatedItems = [];
        const { metadataCache } = this.app;
        const { file, suggestion } = sourceInfo;
        const enabledRelatedItems = new Set(this.settings.enabledRelatedItems);
        const activeFacetIds = this.getActiveFacetIds(inputInfo);
        const shouldIncludeRelation = (relationType) => {
            return (enabledRelatedItems.has(relationType) &&
                this.isFacetedWith(activeFacetIds, relationType));
        };
        if (shouldIncludeRelation(RelationType.Backlink)) {
            let targetPath = file?.path;
            let linkMap = metadataCache.resolvedLinks;
            if (isUnresolvedSuggestion(suggestion)) {
                targetPath = suggestion.linktext;
                linkMap = metadataCache.unresolvedLinks;
            }
            this.addBacklinks(targetPath, linkMap, relatedItems);
        }
        if (shouldIncludeRelation(RelationType.DiskLocation)) {
            this.addRelatedDiskFiles(file, relatedItems);
        }
        if (shouldIncludeRelation(RelationType.OutgoingLink)) {
            this.addOutgoingLinks(file, relatedItems);
        }
        return relatedItems;
    }
    addRelatedDiskFiles(sourceFile, collection) {
        const { excludeRelatedFolders, excludeOpenRelatedFiles } = this.settings;
        if (sourceFile) {
            const isExcludedFolder = matcherFnForRegExList(excludeRelatedFolders);
            let nodes = [...sourceFile.parent.children];
            while (nodes.length > 0) {
                const node = nodes.pop();
                if (isTFile(node)) {
                    const isSourceFile = node === sourceFile;
                    const isExcluded = isSourceFile ||
                        (excludeOpenRelatedFiles && !!this.findMatchingLeaf(node).leaf);
                    if (!isExcluded) {
                        collection.push({ file: node, relationType: RelationType.DiskLocation });
                    }
                }
                else if (!isExcludedFolder(node.path)) {
                    nodes = nodes.concat(node.children);
                }
            }
        }
    }
    addOutgoingLinks(sourceFile, collection) {
        if (sourceFile) {
            const destUnresolved = new Map();
            const destFiles = new Map();
            const { metadataCache } = this.app;
            const outgoingLinks = metadataCache.getFileCache(sourceFile).links ?? [];
            const incrementCount = (info) => info ? !!(info.count += 1) : false;
            outgoingLinks.forEach((linkCache) => {
                const destPath = linkCache.link;
                const destFile = metadataCache.getFirstLinkpathDest(destPath, sourceFile.path);
                let info;
                if (destFile) {
                    if (!incrementCount(destFiles.get(destFile)) && destFile !== sourceFile) {
                        info = { file: destFile, relationType: RelationType.OutgoingLink, count: 1 };
                        destFiles.set(destFile, info);
                        collection.push(info);
                    }
                }
                else {
                    if (!incrementCount(destUnresolved.get(destPath))) {
                        info = {
                            file: null,
                            relationType: RelationType.OutgoingLink,
                            unresolvedText: destPath,
                            count: 1,
                        };
                        destUnresolved.set(destPath, info);
                        collection.push(info);
                    }
                }
            });
        }
    }
    addBacklinks(targetPath, linkMap, collection) {
        for (const [originFilePath, destPathMap] of Object.entries(linkMap)) {
            if (originFilePath !== targetPath &&
                Object.prototype.hasOwnProperty.call(destPathMap, targetPath)) {
                const count = destPathMap[targetPath];
                const originFile = this.getTFileByPath(originFilePath);
                if (originFile) {
                    collection.push({
                        count,
                        file: originFile,
                        relationType: RelationType.Backlink,
                    });
                }
            }
        }
    }
    reset() {
        this.inputInfo = null;
    }
    getSourceInfo(activeSuggestion, activeLeaf, isPrefixCmd, sessionOpts) {
        const prevInputInfo = this.inputInfo;
        let prevSourceInfo = null;
        let prevMode = Mode.Standard;
        if (prevInputInfo) {
            prevSourceInfo = prevInputInfo.parsedCommand().source;
            prevMode = prevInputInfo.mode;
        }
        // figure out if the previous operation was a symbol operation
        const hasPrevSource = prevMode === Mode.RelatedItemsList && !!prevSourceInfo;
        const activeEditorInfo = this.getEditorInfo(activeLeaf);
        const activeSuggInfo = this.getSuggestionInfo(activeSuggestion);
        if (!activeSuggInfo.isValidSource && isUnresolvedSuggestion(activeSuggestion)) {
            // related items supports retrieving backlinks for unresolved suggestion, so
            // force UnresolvedSuggestion to be valid, even though it would otherwise not be
            activeSuggInfo.isValidSource = true;
        }
        // Pick the source file for the operation, prioritizing
        // any pre-existing operation that was in progress
        let sourceInfo = null;
        if (hasPrevSource) {
            sourceInfo = prevSourceInfo;
        }
        else if (activeSuggInfo.isValidSource && !sessionOpts.useActiveEditorAsSource) {
            sourceInfo = activeSuggInfo;
        }
        else if (activeEditorInfo.isValidSource && isPrefixCmd) {
            sourceInfo = activeEditorInfo;
        }
        return sourceInfo;
    }
    createSuggestion(currentWorkspaceEnvList, item, result, preferredTitle) {
        let sugg = {
            item,
            file: item?.file,
            type: SuggestionType.RelatedItemsList,
            preferredTitle,
            ...result,
        };
        sugg = Handler.updateWorkspaceEnvListStatus(currentWorkspaceEnvList, sugg);
        return this.applyMatchPriorityPreferences(sugg);
    }
}

class VaultHandler extends Handler {
    constructor() {
        super(...arguments);
        this.mobileVaultChooserMarker = {
            type: SuggestionType.VaultList,
            match: null,
            item: null,
            pathSegments: null,
        };
    }
    getCommandString(_sessionOpts) {
        return this.settings?.vaultListCommand;
    }
    validateCommand(inputInfo, index, filterText, _activeSuggestion, _activeLeaf) {
        inputInfo.mode = Mode.VaultList;
        const cmd = inputInfo.parsedCommand(Mode.VaultList);
        cmd.index = index;
        cmd.parsedInput = filterText;
        cmd.isValidated = true;
        return cmd;
    }
    getSuggestions(inputInfo) {
        const suggestions = [];
        if (inputInfo) {
            inputInfo.buildSearchQuery();
            const { hasSearchTerm, prepQuery } = inputInfo.searchQuery;
            const items = obsidian.Platform.isDesktop
                ? this.getItems()
                : [this.mobileVaultChooserMarker];
            items.forEach((item) => {
                let shouldPush = true;
                if (hasSearchTerm) {
                    const results = this.fuzzySearchWithFallback(prepQuery, null, item.pathSegments);
                    Object.assign(item, results);
                    shouldPush = !!results.match;
                }
                if (shouldPush) {
                    suggestions.push(item);
                }
            });
            if (hasSearchTerm) {
                obsidian.sortSearchResults(suggestions);
            }
        }
        return suggestions;
    }
    renderSuggestion(sugg, parentEl) {
        let handled = false;
        if (sugg) {
            this.addClassesToSuggestionContainer(parentEl, ['qsp-suggestion-vault']);
            handled = true;
            if (obsidian.Platform.isDesktop) {
                this.renderVaultSuggestion(sugg, parentEl);
            }
            else if (sugg === this.mobileVaultChooserMarker) {
                this.renderMobileHintSuggestion(parentEl);
            }
        }
        return handled;
    }
    renderMobileHintSuggestion(parentEl) {
        this.renderContent(parentEl, 'Show mobile vault chooser', null);
    }
    renderVaultSuggestion(sugg, parentEl) {
        const { pathSegments, matchType } = sugg;
        let { match } = sugg;
        let basenameMatch = null;
        if (matchType === MatchType.Basename) {
            basenameMatch = match;
            match = null;
        }
        const contentEl = this.renderContent(parentEl, pathSegments.basename, basenameMatch);
        const wrapperEl = contentEl.createDiv({ cls: ['suggestion-note', 'qsp-note'] });
        const iconEl = wrapperEl.createSpan({ cls: ['qsp-path-indicator'] });
        const pathEl = wrapperEl.createSpan({ cls: 'qsp-path' });
        obsidian.setIcon(iconEl, 'folder');
        obsidian.renderResults(pathEl, pathSegments.path, match);
    }
    onChooseSuggestion(sugg, _evt) {
        let handled = false;
        if (sugg) {
            if (obsidian.Platform.isDesktop) {
                // 12/8/23: "vault-open" is the Obsidian defined channel for open a vault
                handled = electron.ipcRenderer.sendSync('vault-open', sugg.pathSegments?.path, false);
            }
            else if (sugg === this.mobileVaultChooserMarker) {
                // It's the mobile app context, show the vault chooser
                this.app.openVaultChooser();
                handled = true;
            }
        }
        return handled;
    }
    getItems() {
        const items = [];
        try {
            // 12/8/23: "vault-list" is the Obsidian defined channel for retrieving
            // the vault list
            const vaultData = electron.ipcRenderer.sendSync('vault-list');
            if (vaultData) {
                for (const [id, { path, open }] of Object.entries(vaultData)) {
                    const basename = filenameFromPath(path);
                    const sugg = {
                        type: SuggestionType.VaultList,
                        match: null,
                        item: id,
                        isOpen: !!open,
                        pathSegments: { basename, path },
                    };
                    items.push(sugg);
                }
            }
        }
        catch (err) {
            console.log('Switcher++: error retrieving list of available vaults. ', err);
        }
        return items.sort((a, b) => a.pathSegments.basename.localeCompare(b.pathSegments.basename));
    }
}

const lastInputInfoByMode = {};
class ModeHandler {
    constructor(app, settings, exKeymap) {
        this.app = app;
        this.settings = settings;
        this.exKeymap = exKeymap;
        this.sessionOpts = {};
        this.noResultActionModes = [Mode.HeadingsList, Mode.WorkspaceList];
        // StandardExHandler one is special in that it is not a "full" handler,
        // and not attached to a mode, as a result it is not in the handlersByMode list
        const standardExHandler = new StandardExHandler(app, settings);
        const handlersByMode = new Map([
            [Mode.SymbolList, new SymbolHandler(app, settings)],
            [Mode.WorkspaceList, new WorkspaceHandler(app, settings)],
            [Mode.HeadingsList, new HeadingsHandler(app, settings)],
            [Mode.EditorList, new EditorHandler(app, settings)],
            [Mode.BookmarksList, new BookmarksHandler(app, settings)],
            [Mode.CommandList, new CommandHandler(app, settings)],
            [Mode.RelatedItemsList, new RelatedItemsHandler(app, settings)],
            [Mode.VaultList, new VaultHandler(app, settings)],
        ]);
        this.handlersByMode = handlersByMode;
        this.handlersByType = new Map([
            [SuggestionType.CommandList, handlersByMode.get(Mode.CommandList)],
            [SuggestionType.EditorList, handlersByMode.get(Mode.EditorList)],
            [SuggestionType.HeadingsList, handlersByMode.get(Mode.HeadingsList)],
            [SuggestionType.RelatedItemsList, handlersByMode.get(Mode.RelatedItemsList)],
            [SuggestionType.Bookmark, handlersByMode.get(Mode.BookmarksList)],
            [SuggestionType.SymbolList, handlersByMode.get(Mode.SymbolList)],
            [SuggestionType.WorkspaceList, handlersByMode.get(Mode.WorkspaceList)],
            [SuggestionType.VaultList, handlersByMode.get(Mode.VaultList)],
            [SuggestionType.File, standardExHandler],
            [SuggestionType.Alias, standardExHandler],
        ]);
        this.handlersByCommand = new Map([
            [settings.editorListCommand, handlersByMode.get(Mode.EditorList)],
            [settings.workspaceListCommand, handlersByMode.get(Mode.WorkspaceList)],
            [settings.headingsListCommand, handlersByMode.get(Mode.HeadingsList)],
            [settings.bookmarksListCommand, handlersByMode.get(Mode.BookmarksList)],
            [settings.commandListCommand, handlersByMode.get(Mode.CommandList)],
            [settings.symbolListCommand, handlersByMode.get(Mode.SymbolList)],
            [settings.symbolListActiveEditorCommand, handlersByMode.get(Mode.SymbolList)],
            [settings.relatedItemsListCommand, handlersByMode.get(Mode.RelatedItemsList)],
            [settings.vaultListCommand, handlersByMode.get(Mode.VaultList)],
            [
                settings.relatedItemsListActiveEditorCommand,
                handlersByMode.get(Mode.RelatedItemsList),
            ],
        ]);
        this.debouncedGetSuggestions = obsidian.debounce(this.getSuggestions.bind(this), settings.headingsSearchDebounceMilli, true);
        this.reset();
    }
    onOpen() {
        const { exKeymap, settings } = this;
        exKeymap.isOpen = true;
        if (settings.quickFilters?.shouldResetActiveFacets) {
            Object.values(settings.quickFilters.facetList).forEach((f) => (f.isActive = false));
        }
    }
    onClose() {
        this.exKeymap.isOpen = false;
    }
    setSessionOpenMode(mode, chooser, sessionOpts) {
        this.reset();
        chooser?.setSuggestions([]);
        if (mode !== Mode.Standard) {
            const openModeString = this.getHandler(mode).getCommandString(sessionOpts);
            Object.assign(this.sessionOpts, sessionOpts, { openModeString });
        }
        if (lastInputInfoByMode[mode]) {
            if ((mode === Mode.CommandList && this.settings.preserveCommandPaletteLastInput) ||
                (mode !== Mode.CommandList && this.settings.preserveQuickSwitcherLastInput)) {
                const lastInfo = lastInputInfoByMode[mode];
                this.lastInput = lastInfo.inputText;
            }
        }
    }
    insertSessionOpenModeOrLastInputString(inputEl) {
        const { sessionOpts, lastInput } = this;
        const openModeString = sessionOpts.openModeString ?? null;
        if (lastInput && lastInput !== openModeString) {
            inputEl.value = lastInput;
            // `openModeString` may `null` when in standard mode
            // otherwise `lastInput` starts with `openModeString`
            const startsNumber = openModeString ? openModeString.length : 0;
            inputEl.setSelectionRange(startsNumber, inputEl.value.length);
        }
        else if (openModeString !== null && openModeString !== '') {
            // update UI with current command string in the case were openInMode was called
            inputEl.value = openModeString;
            // reset to null so user input is not overridden the next time onInput is called
            sessionOpts.openModeString = null;
        }
        // the same logic as `openModeString`
        // make sure it will not override user's normal input.
        this.lastInput = null;
    }
    updateSuggestions(query, chooser, modal) {
        const { exKeymap, settings, sessionOpts } = this;
        let handled = false;
        // cancel any potentially previously running debounced getSuggestions call
        this.debouncedGetSuggestions.cancel();
        // get the currently active leaf across all rootSplits
        const activeLeaf = Handler.getActiveLeaf(this.app.workspace);
        const activeSugg = ModeHandler.getActiveSuggestion(chooser);
        const inputInfo = this.determineRunMode(query, activeSugg, activeLeaf, sessionOpts);
        this.inputInfo = inputInfo;
        const { mode } = inputInfo;
        lastInputInfoByMode[mode] = inputInfo;
        this.updatedKeymapForMode(inputInfo, chooser, modal, exKeymap, settings, activeLeaf);
        this.toggleMobileCreateFileButton(modal, mode, settings);
        if (mode !== Mode.Standard) {
            if (mode === Mode.HeadingsList && inputInfo.parsedCommand().parsedInput?.length) {
                // if headings mode and user is typing a query, delay getting suggestions
                this.debouncedGetSuggestions(inputInfo, chooser, modal);
            }
            else {
                this.getSuggestions(inputInfo, chooser, modal);
            }
            handled = true;
        }
        return handled;
    }
    /**
     * Sets the allowCreateNewFile property of the modal based on config settings and mode
     * @param  {SwitcherPlus} modal
     * @param  {Mode} mode
     * @param  {SwitcherPlusSettings} config
     * @returns void
     */
    toggleMobileCreateFileButton(modal, mode, config) {
        if (!obsidian.Platform.isMobile) {
            return;
        }
        const modeName = Mode[mode];
        modal.allowCreateNewFile = config.allowCreateNewFileInModeNames.includes(modeName);
        if (!modal.allowCreateNewFile) {
            // If file creation is disabled, remove the button from the DOM.
            // Note that when enabled, the core switcher will add automatically add
            // createButtonEl back to the DOM.
            modal.createButtonEl?.detach();
        }
    }
    updatedKeymapForMode(inputInfo, chooser, modal, exKeymap, settings, activeLeaf) {
        const { mode } = inputInfo;
        const handler = this.getHandler(mode);
        const facetList = handler?.getAvailableFacets(inputInfo) ?? [];
        const handleFacetKeyEvent = (facets, isReset) => {
            if (isReset) {
                // cycle between making all facets active/inactive
                const hasActive = facets.some((v) => v.isActive === true);
                handler.activateFacet(facets, !hasActive);
            }
            else {
                // expect facets to contain only one item that needs to be toggled
                handler.activateFacet(facets, !facets[0].isActive);
            }
            // refresh the suggestion list after changing the list of active facets
            this.updatedKeymapForMode(inputInfo, chooser, modal, exKeymap, settings, activeLeaf);
            this.getSuggestions(inputInfo, chooser, modal);
            // prevent default handling of key press afterwards
            return false;
        };
        const keymapConfig = {
            mode,
            activeLeaf,
            facets: {
                facetList,
                facetSettings: settings.quickFilters,
                onToggleFacet: handleFacetKeyEvent.bind(this),
            },
        };
        exKeymap.updateKeymapForMode(keymapConfig);
    }
    renderSuggestion(sugg, parentEl) {
        const { inputInfo, settings: { overrideStandardModeBehaviors }, } = this;
        const { mode } = inputInfo;
        const isHeadingMode = mode === Mode.HeadingsList;
        let handled = false;
        const systemBehaviorPreferred = new Set([
            SuggestionType.Unresolved,
            SuggestionType.Bookmark,
        ]);
        if (sugg === null) {
            if (isHeadingMode) {
                // in Headings mode, a null suggestion should be rendered to allow for note creation
                const headingHandler = this.getHandler(mode);
                const searchText = inputInfo.parsedCommand(mode)?.parsedInput;
                headingHandler.renderFileCreationSuggestion(parentEl, searchText);
                handled = true;
            }
        }
        else if (!systemBehaviorPreferred.has(sugg.type)) {
            if (overrideStandardModeBehaviors || isHeadingMode || isExSuggestion(sugg)) {
                // when overriding standard mode, or, in Headings mode, StandardExHandler should
                // handle rendering for FileSuggestion and Alias suggestion
                const handler = this.getHandler(sugg);
                if (handler) {
                    if (mode === Mode.Standard) {
                        // suggestions in standard mode are created by core Obsidian and are
                        // missing some properties, try to add them
                        handler.addPropertiesToStandardSuggestions(inputInfo, sugg);
                    }
                    handled = handler.renderSuggestion(sugg, parentEl);
                }
            }
        }
        return handled;
    }
    onChooseSuggestion(sugg, evt) {
        const { inputInfo, settings: { overrideStandardModeBehaviors }, } = this;
        const { mode } = inputInfo;
        const isHeadingMode = mode === Mode.HeadingsList;
        let handled = false;
        const systemBehaviorPreferred = new Set([
            SuggestionType.Unresolved,
            SuggestionType.Bookmark,
        ]);
        if (sugg === null) {
            if (this.noResultActionModes.includes(mode)) {
                // In these modes, a null suggestion indicates that
                // the <enter to create> UI action was chosen
                const handler = this.getHandler(mode);
                handled = !!handler?.onNoResultsCreateAction(inputInfo, evt);
            }
        }
        else if (!systemBehaviorPreferred.has(sugg.type)) {
            if (overrideStandardModeBehaviors || isHeadingMode || isExSuggestion(sugg)) {
                // when overriding standard mode, or, in Headings mode, StandardExHandler should
                // handle the onChoose action for File and Alias suggestion so that
                // the preferOpenInNewPane setting can be handled properly
                const handler = this.getHandler(sugg);
                if (handler) {
                    handled = handler.onChooseSuggestion(sugg, evt);
                }
            }
        }
        return handled;
    }
    determineRunMode(query, activeSugg, activeLeaf, sessionOpts) {
        const input = query ?? '';
        const info = new InputInfo(input, Mode.Standard, sessionOpts);
        this.addWorkspaceEnvLists(info);
        if (input.length === 0) {
            this.reset();
        }
        this.validatePrefixCommands(info, activeSugg, activeLeaf, this.settings);
        return info;
    }
    getSuggestions(inputInfo, chooser, modal) {
        chooser.setSuggestions([]);
        const { mode } = inputInfo;
        const suggestions = this.getHandler(mode).getSuggestions(inputInfo);
        const setSuggestions = (suggs) => {
            if (suggs?.length) {
                chooser.setSuggestions(suggs);
                ModeHandler.setActiveSuggestion(mode, chooser);
            }
            else {
                if (this.noResultActionModes.includes(mode) &&
                    inputInfo.parsedCommand(mode).parsedInput) {
                    modal.onNoSuggestion();
                }
                else {
                    chooser.setSuggestions(null);
                }
            }
        };
        if (Array.isArray(suggestions)) {
            setSuggestions(suggestions);
        }
        else {
            suggestions.then((values) => {
                setSuggestions(values);
            }, (reason) => {
                console.log('Switcher++: error retrieving suggestions as Promise. ', reason);
            });
        }
    }
    removeEscapeCommandCharFromInput(inputInfo, escapeCmdChar, cmdStr) {
        const sansEscapeInput = inputInfo.inputTextSansEscapeChar.replace(new RegExp(`(?:${escapeRegExp(escapeCmdChar)})(?:${escapeRegExp(cmdStr)})`), cmdStr);
        inputInfo.inputTextSansEscapeChar = sansEscapeInput;
        return sansEscapeInput;
    }
    validatePrefixCommands(inputInfo, activeSugg, activeLeaf, config) {
        let cmdStr = null;
        let handler = null;
        const activeEditorCmds = [
            config.symbolListActiveEditorCommand,
            config.relatedItemsListActiveEditorCommand,
        ];
        const prefixCmds = [
            config.editorListCommand,
            config.workspaceListCommand,
            config.headingsListCommand,
            config.bookmarksListCommand,
            config.commandListCommand,
            config.vaultListCommand,
        ]
            .concat(activeEditorCmds)
            .map((v) => `(?:${escapeRegExp(v)})`)
            // account for potential overlapping command strings
            .sort((a, b) => b.length - a.length);
        // regex that matches any of the prefix commands
        const match = new RegExp(`^((?:${escapeRegExp(config.escapeCmdChar)})?)(${prefixCmds.join('|')})`).exec(inputInfo.inputText);
        if (match) {
            const containsNegation = !!match[1].length;
            cmdStr = match[2];
            if (containsNegation) {
                this.removeEscapeCommandCharFromInput(inputInfo, config.escapeCmdChar, cmdStr);
                cmdStr = null;
            }
            else {
                handler = this.getHandler(cmdStr);
            }
        }
        const isValidated = this.validateSourcedCommands(inputInfo, cmdStr, activeSugg, activeLeaf, config);
        if (!isValidated && handler) {
            inputInfo.sessionOpts.useActiveEditorAsSource = activeEditorCmds.includes(cmdStr);
            const filterText = inputInfo.inputTextSansEscapeChar.slice(cmdStr.length);
            handler.validateCommand(inputInfo, match.index, filterText, activeSugg, activeLeaf);
        }
    }
    validateSourcedCommands(inputInfo, parsedPrefixCmd, activeSugg, activeLeaf, config) {
        let isValidated = false;
        const unmatchedHandlers = [];
        const searchText = inputInfo.inputTextSansEscapeChar;
        // Headings, Bookmarks, and EditorList mode can have an embedded command
        const supportedModes = [
            config.editorListCommand,
            config.headingsListCommand,
            config.bookmarksListCommand,
        ];
        // A falsy parsedPrefixCmd indicates Standard mode since no prefix command was matched
        if (!parsedPrefixCmd || supportedModes.includes(parsedPrefixCmd)) {
            let match = null;
            const sourcedCmds = [config.symbolListCommand, config.relatedItemsListCommand]
                .map((v) => `(?:${escapeRegExp(v)})`)
                .sort((a, b) => b.length - a.length);
            const re = new RegExp(`((?:${escapeRegExp(config.escapeCmdChar)})?)(${sourcedCmds.join('|')})`, 'g');
            while ((match = re.exec(searchText)) !== null) {
                const containsNegation = !!match[1].length;
                const cmdStr = match[2];
                if (containsNegation) {
                    this.removeEscapeCommandCharFromInput(inputInfo, config.escapeCmdChar, cmdStr);
                }
                else {
                    const filterText = searchText.slice(re.lastIndex);
                    const handler = this.getHandler(cmdStr);
                    if (handler) {
                        const cmd = handler.validateCommand(inputInfo, match.index, filterText, activeSugg, activeLeaf);
                        isValidated = !!cmd?.isValidated;
                        // Find all sourced handlers that did not match
                        const unmatched = this.getSourcedHandlers().filter((v) => v !== handler);
                        unmatchedHandlers.push(...unmatched);
                    }
                    break;
                }
            }
        }
        // if unmatchedHandlers has items then there was a match, so reset all others
        // otherwise reset all sourced handlers
        this.resetSourcedHandlers(unmatchedHandlers.length ? unmatchedHandlers : null);
        return isValidated;
    }
    static setActiveSuggestion(mode, chooser) {
        // only symbol mode currently sets an active selection
        if (mode === Mode.SymbolList) {
            const index = chooser.values
                .filter((v) => isSymbolSuggestion(v))
                .findIndex((v) => v.item.isSelected);
            if (index !== -1) {
                chooser.setSelectedItem(index, null);
                chooser.suggestions[chooser.selectedItem].scrollIntoView(false);
            }
        }
    }
    static getActiveSuggestion(chooser) {
        let activeSuggestion = null;
        if (chooser?.values) {
            activeSuggestion = chooser.values[chooser.selectedItem];
        }
        return activeSuggestion;
    }
    reset() {
        this.inputInfo = new InputInfo();
        this.sessionOpts = {};
        this.resetSourcedHandlers();
    }
    resetSourcedHandlers(handlers) {
        handlers = handlers ?? this.getSourcedHandlers();
        handlers.forEach((handler) => handler?.reset());
    }
    getSourcedHandlers() {
        const sourcedModes = [Mode.RelatedItemsList, Mode.SymbolList];
        return sourcedModes.map((v) => this.getHandler(v));
    }
    addWorkspaceEnvLists(inputInfo) {
        if (inputInfo) {
            const openEditors = this.getHandler(Mode.EditorList).getItems();
            // Create a Set containing the files from all the open editors
            const openEditorFilesSet = openEditors
                .map((leaf) => leaf?.view?.file)
                .filter((file) => !!file)
                .reduce((collection, file) => collection.add(file), new Set());
            // Get the list of bookmarks split into file bookmarks and non-file bookmarks
            const { fileBookmarks, nonFileBookmarks } = this.getHandler(Mode.BookmarksList).getItems(null);
            const lists = inputInfo.currentWorkspaceEnvList;
            lists.openWorkspaceLeaves = new Set(openEditors);
            lists.openWorkspaceFiles = openEditorFilesSet;
            lists.fileBookmarks = fileBookmarks;
            lists.nonFileBookmarks = nonFileBookmarks;
            lists.attachmentFileExtensions = this.getAttachmentFileExtensions(this.app.viewRegistry, this.settings.fileExtAllowList);
            // Get the list of recently closed files excluding the currently open ones
            const maxCount = openEditorFilesSet.size + this.settings.maxRecentFileSuggestionsOnInit;
            lists.mostRecentFiles = this.getRecentFiles(openEditorFilesSet, maxCount);
        }
        return inputInfo;
    }
    getAttachmentFileExtensions(viewRegistry, exemptFileExtensions) {
        const extList = new Set();
        try {
            const coreExts = new Set(['md', 'canvas', ...exemptFileExtensions]);
            // Add the list of registered extensions to extList, excluding the markdown and canvas
            Object.keys(viewRegistry.typeByExtension).reduce((collection, ext) => {
                if (!coreExts.has(ext)) {
                    collection.add(ext);
                }
                return collection;
            }, extList);
        }
        catch (err) {
            console.log('Switcher++: error retrieving attachment list from ViewRegistry', err);
        }
        return extList;
    }
    getRecentFiles(ignoreFiles, maxCount = 75) {
        ignoreFiles = ignoreFiles ?? new Set();
        const recentFiles = new Set();
        if (maxCount > 0) {
            const { workspace, vault } = this.app;
            const recentFilePaths = workspace.getRecentFiles({
                showMarkdown: true,
                showCanvas: true,
                showNonImageAttachments: true,
                showImages: true,
                maxCount,
            });
            recentFilePaths?.forEach((path) => {
                const file = vault.getAbstractFileByPath(path);
                if (isTFile(file) && !ignoreFiles.has(file)) {
                    recentFiles.add(file);
                }
            });
        }
        return recentFiles;
    }
    inputTextForStandardMode(input) {
        const { mode, inputTextSansEscapeChar } = this.inputInfo;
        let searchText = input;
        if (mode === Mode.Standard && inputTextSansEscapeChar?.length) {
            searchText = inputTextSansEscapeChar;
        }
        return searchText;
    }
    getHandler(kind) {
        let handler;
        const { handlersByMode, handlersByType, handlersByCommand } = this;
        if (typeof kind === 'number') {
            handler = handlersByMode.get(kind);
        }
        else if (isOfType(kind, 'type')) {
            handler = handlersByType.get(kind.type);
        }
        else if (typeof kind === 'string') {
            handler = handlersByCommand.get(kind);
        }
        return handler;
    }
}

class SwitcherPlusKeymap {
    get isOpen() {
        return this._isOpen;
    }
    set isOpen(value) {
        this._isOpen = value;
    }
    constructor(app, scope, chooser, modal, config) {
        this.app = app;
        this.scope = scope;
        this.chooser = chooser;
        this.modal = modal;
        this.config = config;
        this.standardKeysInfo = [];
        this.customKeysInfo = [];
        this.savedStandardKeysInfo = [];
        this.customInstructionEls = new Map();
        this.facetKeysInfo = [];
        this.insertIntoEditorKeysInfo = [];
        this.modKey = 'Ctrl';
        this.modifierToPlatformStrMap = {
            Mod: 'Ctrl',
            Ctrl: 'Ctrl',
            Meta: 'Win',
            Alt: 'Alt',
            Shift: 'Shift',
        };
        if (obsidian.Platform.isMacOS) {
            this.modKey = 'Meta';
            this.modifierToPlatformStrMap = {
                Mod: '⌘',
                Ctrl: '⌃',
                Meta: '⌘',
                Alt: '⌥',
                Shift: '⇧',
            };
        }
        this.initKeysInfo();
        this.removeDefaultTabKeyBinding(scope, config);
        this.registerNavigationBindings(scope, config.navigationKeys);
        this.registerEditorTabBindings(scope);
        this.registerCloseWhenEmptyBindings(scope, config);
        this.standardInstructionsEl =
            modal.modalEl.querySelector('.prompt-instructions');
    }
    initKeysInfo() {
        const customFileBasedModes = [
            Mode.EditorList,
            Mode.HeadingsList,
            Mode.RelatedItemsList,
            Mode.BookmarksList,
            Mode.SymbolList,
        ];
        // standard mode keys that are registered by default, and
        // should be unregistered in custom modes, then re-registered in standard mode
        // example: { modifiers: 'Shift', key: 'Enter' }
        const standardKeysInfo = [];
        // custom mode keys that should be registered, then unregistered in standard mode
        // Note: modifiers should be a comma separated string of Modifiers
        // without any padding space characters
        const customKeysInfo = [
            {
                isInstructionOnly: true,
                modes: customFileBasedModes,
                modifiers: null,
                key: null,
                func: null,
                command: this.commandDisplayStr(['Mod'], '↵'),
                purpose: 'open in new tab',
            },
            {
                isInstructionOnly: true,
                modes: customFileBasedModes,
                modifiers: this.modKey,
                key: '\\',
                func: null,
                command: this.commandDisplayStr(['Mod'], '\\'),
                purpose: 'open to the right',
            },
            {
                isInstructionOnly: true,
                modes: customFileBasedModes,
                modifiers: `${this.modKey},Shift`,
                key: '\\',
                func: null,
                command: this.commandDisplayStr(['Mod', 'Shift'], '\\'),
                purpose: 'open below',
            },
            {
                isInstructionOnly: true,
                modes: customFileBasedModes,
                modifiers: this.modKey,
                key: 'o',
                func: null,
                command: this.commandDisplayStr(['Mod'], 'o'),
                purpose: 'open in new window',
            },
            {
                isInstructionOnly: true,
                modes: [Mode.CommandList],
                modifiers: null,
                key: null,
                func: null,
                command: `↵`,
                purpose: 'execute command',
            },
            {
                isInstructionOnly: true,
                modes: [Mode.WorkspaceList],
                modifiers: null,
                key: null,
                func: null,
                command: `↵`,
                purpose: 'open workspace',
            },
        ];
        this.standardKeysInfo.push(...standardKeysInfo);
        this.customKeysInfo.push(...customKeysInfo);
    }
    removeDefaultTabKeyBinding(scope, config) {
        if (config?.removeDefaultTabBinding) {
            // 07/04/2023: Obsidian registers a binding for Tab key that only returns false
            // remove this binding so Tab can be remapped
            const keymap = scope.keys.find(({ modifiers, key }) => modifiers === null && key === 'Tab');
            scope.unregister(keymap);
        }
    }
    registerNavigationBindings(scope, navConfig) {
        const regKeys = (keys, isNext) => {
            keys.forEach(({ modifiers, key }) => {
                scope.register(modifiers, key, (evt, _ctx) => {
                    this.navigateItems(evt, isNext);
                    return false;
                });
            });
        };
        regKeys(navConfig?.nextKeys ?? [], true);
        regKeys(navConfig?.prevKeys ?? [], false);
    }
    registerFacetBinding(scope, keymapConfig) {
        const { mode, facets } = keymapConfig;
        if (facets?.facetList?.length) {
            const { facetList, facetSettings, onToggleFacet } = facets;
            const { keyList, modifiers, resetKey, resetModifiers } = facetSettings;
            let currKeyListIndex = 0;
            let keyHandler;
            const registerFn = (modKeys, key, facetListLocal, isReset) => {
                return scope.register(modKeys, key, () => onToggleFacet(facetListLocal, isReset));
            };
            // register each of the facets to a corresponding key
            for (let i = 0; i < facetList.length; i++) {
                const facet = facetList[i];
                const facetModifiers = facet.modifiers ?? modifiers;
                let key;
                if (facet.key?.length) {
                    // has override key defined so use it instead of the default
                    key = facet.key;
                }
                else if (currKeyListIndex < keyList.length) {
                    // use up one of the default keys
                    key = keyList[currKeyListIndex];
                    ++currKeyListIndex;
                }
                else {
                    // override key is not defined and no default keys left
                    console.log(`Switcher++: unable to register hotkey for facet: ${facet.label} in mode: ${Mode[mode]} because a trigger key is not specified`);
                    continue;
                }
                keyHandler = registerFn(facetModifiers, key, [facet], false);
                this.facetKeysInfo.push({
                    facet,
                    command: key,
                    purpose: facet.label,
                    ...keyHandler,
                });
            }
            // register the toggle key
            keyHandler = registerFn(resetModifiers ?? modifiers, resetKey, facetList, true);
            this.facetKeysInfo.push({
                facet: null,
                command: resetKey,
                purpose: 'toggle all',
                ...keyHandler,
            });
        }
    }
    registerEditorTabBindings(scope) {
        const keys = [
            [[this.modKey], '\\'],
            [[this.modKey, 'Shift'], '\\'],
            [[this.modKey], 'o'],
        ];
        keys.forEach((v) => {
            scope.register(v[0], v[1], this.useSelectedItem.bind(this));
        });
    }
    registerCloseWhenEmptyBindings(scope, config) {
        const keymaps = config.closeWhenEmptyKeys;
        keymaps?.forEach(({ modifiers, key }) => {
            scope.register(modifiers, key, this.closeModalIfEmpty.bind(this));
        });
    }
    updateInsertIntoEditorCommand(mode, activeEditor, customKeysInfo, insertConfig) {
        const { isEnabled, keymap, insertableEditorTypes } = insertConfig;
        let keyInfo = null;
        if (isEnabled) {
            const excludedModes = [Mode.CommandList, Mode.WorkspaceList, Mode.VaultList];
            const activeViewType = activeEditor?.view?.getViewType();
            const isExcluded = (activeViewType && !insertableEditorTypes.includes(activeViewType)) ||
                excludedModes.includes(mode);
            if (!isExcluded) {
                keyInfo = customKeysInfo.find((v) => v.purpose === keymap.purpose);
                if (!keyInfo) {
                    const { modifiers, key, purpose } = keymap;
                    keyInfo = {
                        isInstructionOnly: false,
                        modes: [],
                        func: null,
                        command: this.commandDisplayStr(modifiers, key),
                        modifiers: modifiers.join(','),
                        key,
                        purpose,
                    };
                    customKeysInfo.push(keyInfo);
                }
                // update the handler to capture the active editor
                keyInfo.func = () => {
                    const { modal, chooser } = this;
                    modal.close();
                    const item = chooser.values?.[chooser.selectedItem];
                    this.insertIntoEditorAsLink(item, activeEditor, insertConfig);
                    return false;
                };
                keyInfo.modes = [mode];
            }
        }
        return keyInfo;
    }
    updateKeymapForMode(keymapConfig) {
        const { mode, activeLeaf } = keymapConfig;
        const { modal, scope, savedStandardKeysInfo, standardKeysInfo, customKeysInfo, facetKeysInfo, config: { insertLinkInEditor }, } = this;
        this.updateInsertIntoEditorCommand(mode, activeLeaf, customKeysInfo, insertLinkInEditor);
        const customKeymaps = customKeysInfo.filter((v) => !v.isInstructionOnly);
        this.unregisterKeys(scope, customKeymaps);
        // remove facet keys and reset storage array
        this.unregisterKeys(scope, facetKeysInfo);
        facetKeysInfo.length = 0;
        const customKeysToAdd = customKeymaps.filter((v) => v.modes?.includes(mode));
        if (mode === Mode.Standard) {
            this.registerKeys(scope, savedStandardKeysInfo);
            savedStandardKeysInfo.length = 0;
            // after (re)registering the standard keys, register any custom keys that
            // should also work in standard mode
            this.registerKeys(scope, customKeysToAdd);
            this.toggleStandardInstructions(true);
        }
        else {
            const standardKeysRemoved = this.unregisterKeys(scope, standardKeysInfo);
            if (standardKeysRemoved.length) {
                savedStandardKeysInfo.push(...standardKeysRemoved);
            }
            this.registerKeys(scope, customKeysToAdd);
            this.registerFacetBinding(scope, keymapConfig);
            this.showCustomInstructions(modal, keymapConfig, customKeysInfo, facetKeysInfo);
        }
    }
    registerKeys(scope, keymaps) {
        keymaps.forEach((keymap) => {
            const modifiers = keymap.modifiers.split(',');
            scope.register(modifiers, keymap.key, keymap.func);
        });
    }
    unregisterKeys(scope, keyInfo) {
        const keysToRemove = [...keyInfo];
        const removed = [];
        let i = scope.keys.length;
        while (i--) {
            const keymap = scope.keys[i];
            const foundIndex = keysToRemove.findIndex((kRemove) => {
                // when the 'Mod' modifier is registered, it gets translated to the platform
                // specific version 'Meta' on MacOS or Ctrl on others, so when unregistering
                // account for this conversion
                const kRemoveModifiers = kRemove.modifiers
                    .split(',')
                    .map((modifier) => (modifier === 'Mod' ? this.modKey : modifier))
                    .join(',');
                return kRemoveModifiers === keymap.modifiers && kRemove.key === keymap.key;
            });
            if (foundIndex >= 0) {
                scope.unregister(keymap);
                removed.push(keymap);
                keysToRemove.splice(foundIndex, 1);
            }
        }
        return removed;
    }
    detachCustomInstructionEls() {
        this.customInstructionEls.forEach((el) => {
            el.detach();
        });
    }
    toggleStandardInstructions(shouldShow) {
        const { standardInstructionsEl } = this;
        let displayValue = 'none';
        if (shouldShow) {
            displayValue = '';
            this.detachCustomInstructionEls();
        }
        if (standardInstructionsEl) {
            standardInstructionsEl.style.display = displayValue;
        }
    }
    showCustomInstructions(modal, keymapConfig, keymapInfo, facetKeysInfo) {
        const { mode, facets } = keymapConfig;
        const { modalEl } = modal;
        const keymaps = keymapInfo.filter((keymap) => keymap.modes?.includes(mode));
        this.toggleStandardInstructions(false);
        this.renderFacetInstructions(modalEl, facets?.facetSettings, facetKeysInfo);
        this.renderCustomInstructions(modalEl, keymaps);
    }
    renderFacetInstructions(parentEl, facetSettings, facetKeysInfo) {
        if (facetKeysInfo?.length && facetSettings.shouldShowFacetInstructions) {
            const modifiersToString = (modifiers) => {
                return modifiers?.toString().replace(',', ' ');
            };
            const facetInstructionsEl = this.getCustomInstructionsEl('facets', parentEl);
            facetInstructionsEl.empty();
            parentEl.appendChild(facetInstructionsEl);
            // render the preamble
            let instructionEl = facetInstructionsEl.createDiv();
            instructionEl.createSpan({
                cls: 'prompt-instruction-command',
                text: `filters | ${modifiersToString(facetSettings.modifiers)}`,
            });
            // render each key instruction
            facetKeysInfo.forEach((facetKeyInfo) => {
                const { facet, command, purpose } = facetKeyInfo;
                let modifiers;
                let key;
                let activeCls = null;
                if (facet) {
                    // Note: the command only contain the key, the modifiers has to be derived
                    key = command;
                    modifiers = facet.modifiers;
                    if (facet.isActive) {
                        activeCls = ['qsp-filter-active'];
                    }
                }
                else {
                    // Note: only the reset key is expected to not have an associated facet
                    key = facetSettings.resetKey;
                    modifiers = facetSettings.resetModifiers;
                }
                // if a modifier is specified for this specific facet, it overrides the
                // default modifier so display that too. Otherwise, just show the key alone
                const commandDisplayText = modifiers
                    ? `(${modifiersToString(modifiers)}) ${key}`
                    : `${key}`;
                instructionEl = facetInstructionsEl.createDiv();
                instructionEl.createSpan({
                    cls: 'prompt-instruction-command',
                    text: commandDisplayText,
                });
                instructionEl.createSpan({
                    cls: activeCls,
                    text: purpose,
                });
            });
        }
    }
    renderCustomInstructions(parentEl, keymapInfo) {
        const customInstructionsEl = this.getCustomInstructionsEl('custom', parentEl);
        customInstructionsEl.empty();
        parentEl.appendChild(customInstructionsEl);
        keymapInfo.forEach((keymap) => {
            const instructionEl = customInstructionsEl.createDiv();
            instructionEl.createSpan({
                cls: 'prompt-instruction-command',
                text: keymap.command,
            });
            instructionEl.createSpan({ text: keymap.purpose });
        });
    }
    getCustomInstructionsEl(kind, parentEl) {
        let el = this.customInstructionEls.get(kind);
        if (!el) {
            // CSS classes for each kind of custom instruction element
            const cls = {
                custom: ['qsp-prompt-instructions'],
                facets: ['qsp-prompt-instructions-facets'],
            };
            el = this.createPromptInstructionsEl(cls[kind], parentEl);
            this.customInstructionEls.set(kind, el);
        }
        return el;
    }
    createPromptInstructionsEl(cls, parentEl) {
        const elInfo = {
            cls: ['prompt-instructions', ...cls],
        };
        return parentEl.createDiv(elInfo);
    }
    closeModalIfEmpty(evt, _ctx) {
        const { modal, config } = this;
        if (config.shouldCloseModalOnBackspace && !modal?.inputEl.value) {
            modal.close();
            evt.preventDefault();
        }
    }
    useSelectedItem(evt, _ctx) {
        this.chooser.useSelectedItem(evt);
    }
    insertIntoEditorAsLink(sugg, activeLeaf, insertConfig) {
        const { app: { workspace, fileManager, vault }, } = this;
        const activeMarkdownView = workspace.getActiveViewOfType(obsidian.MarkdownView);
        const isActiveMarkdown = activeMarkdownView?.leaf === activeLeaf;
        const activeFile = activeMarkdownView?.file;
        if (isActiveMarkdown && activeFile) {
            const linkStr = generateMarkdownLink(fileManager, vault, sugg, activeFile.path, insertConfig);
            if (linkStr) {
                activeMarkdownView.editor?.replaceSelection(linkStr);
            }
        }
    }
    navigateItems(evt, isNext) {
        const { isOpen, chooser } = this;
        if (isOpen) {
            let index = chooser.selectedItem;
            index = isNext ? ++index : --index;
            chooser.setSelectedItem(index, evt);
        }
    }
    commandDisplayStr(modifiers, key) {
        let displayStr = '';
        if (modifiers && key) {
            const { modifierToPlatformStrMap } = this;
            const modifierStr = modifiers
                .map((modifier) => {
                return modifierToPlatformStrMap[modifier]?.toLocaleLowerCase();
            })
                .join(' ');
            displayStr = `${modifierStr} ${key}`;
        }
        return displayStr;
    }
}

function createSwitcherPlus(app, plugin) {
    const SystemSwitcherModal = getSystemSwitcherInstance(app)
        ?.QuickSwitcherModal;
    if (!SystemSwitcherModal) {
        console.log('Switcher++: unable to extend system switcher. Plugin UI will not be loaded. Use the builtin switcher instead.');
        return null;
    }
    const SwitcherPlusModal = class extends SystemSwitcherModal {
        constructor(app, plugin) {
            super(app, plugin.options.builtInSystemOptions);
            this.plugin = plugin;
            const { options } = plugin;
            options.shouldShowAlias = this.shouldShowAlias;
            const exKeymap = new SwitcherPlusKeymap(app, this.scope, this.chooser, this, options);
            this.exMode = new ModeHandler(app, options, exKeymap);
        }
        openInMode(mode, sessionOpts) {
            this.exMode.setSessionOpenMode(mode, this.chooser, sessionOpts);
            super.open();
        }
        onOpen() {
            this.exMode.onOpen();
            super.onOpen();
        }
        onClose() {
            super.onClose();
            this.exMode.onClose();
        }
        updateSuggestions() {
            const { exMode, inputEl, chooser } = this;
            exMode.insertSessionOpenModeOrLastInputString(inputEl);
            if (!exMode.updateSuggestions(inputEl.value, chooser, this)) {
                super.updateSuggestions();
            }
        }
        getSuggestions(input) {
            const query = this.exMode.inputTextForStandardMode(input);
            return super.getSuggestions(query);
        }
        onChooseSuggestion(item, evt) {
            if (!this.exMode.onChooseSuggestion(item, evt)) {
                super.onChooseSuggestion(item, evt);
            }
        }
        renderSuggestion(value, parentEl) {
            if (!this.exMode.renderSuggestion(value, parentEl)) {
                super.renderSuggestion(value, parentEl);
            }
        }
    };
    return new SwitcherPlusModal(app, plugin);
}

/**
 * Creates a custom launcher button element by cloning then modifying coreLauncherButtonEl
 * @param  {Element} coreLauncherButtonEl the ootb system launcher button element
 * @param  {MobileLauncherConfig} launcherConfig
 * @param  {()=>void} onclickListener event handler to attach to the new custom button
 * @returns HTMLElement the new custom button element that was created
 */
function createQSPLauncherButton(coreLauncherButtonEl, launcherConfig, onclickListener) {
    let qspLauncherButtonEl = null;
    if (coreLauncherButtonEl) {
        // April 2024: cloneNode(true) should perform a deep copy, but does not copy
        // any event handlers that were attached using addEventListener(), which
        // corePlusButtonEl does use, so it can be safely cloned.
        // Additionally, cloneNode() will copy element ID/Name as well which could result
        // in duplicates, but corePlusButtonEl does not contain ID/Name so it's also safe
        qspLauncherButtonEl = coreLauncherButtonEl.cloneNode(true);
        if (qspLauncherButtonEl) {
            const { iconName, coreLauncherButtonIconSelector } = launcherConfig;
            qspLauncherButtonEl.addClass('qsp-mobile-launcher-button');
            qspLauncherButtonEl.addEventListener('click', onclickListener);
            if (iconName?.length) {
                // Override the core icon, if a custom icon file name is provided
                const iconEl = qspLauncherButtonEl.querySelector(coreLauncherButtonIconSelector);
                if (iconEl) {
                    obsidian.setIcon(iconEl, iconName);
                }
            }
        }
    }
    return qspLauncherButtonEl;
}
/**
 * Remove coreButtonEl from DOM and replaces it with qspButtonEl
 * @param  {Element} coreButtonEl
 * @param  {HTMLElement} qspButtonEl
 * @returns boolean True if succeeded
 */
function replaceCoreLauncherButtonWithQSPButton(coreButtonEl, qspButtonEl) {
    let isSuccessful = false;
    if (coreButtonEl && qspButtonEl) {
        // Hide the button before adding to DOM
        const initialDisplay = qspButtonEl.style.display;
        qspButtonEl.style.display = 'none';
        if (coreButtonEl.insertAdjacentElement('beforebegin', qspButtonEl)) {
            coreButtonEl.remove();
            isSuccessful = true;
        }
        qspButtonEl.style.display = initialDisplay;
    }
    return isSuccessful;
}
/**
 * Finds the "⊕" button element using the default selector.
 * If that fails, retries using the selector stored in settings
 * @param  {App} app
 * @param  {MobileLauncherConfig} launcherConfig
 * @returns Element The button Element
 */
function getCoreLauncherButtonElement(app, launcherConfig) {
    let coreLauncherButtonEl = null;
    const containerEl = app?.mobileNavbar?.containerEl;
    if (containerEl) {
        coreLauncherButtonEl = containerEl.querySelector(SwitcherPlusSettings.defaults.mobileLauncher.coreLauncherButtonSelector);
        if (!coreLauncherButtonEl) {
            // Element wasn't found using the default selector, try using the custom selector
            coreLauncherButtonEl = containerEl.querySelector(launcherConfig.coreLauncherButtonSelector);
        }
    }
    return coreLauncherButtonEl;
}
class MobileLauncher {
    /**
     * Overrides the default functionality of the "⊕" button on mobile platforms
     * to launch Switcher++ instead of the default system switcher.
     * @param  {App} app
     * @param  {MobileLauncherConfig} launcherConfig
     * @param  {()=>void} onclickListener event handler to attach to the new custom button
     * @returns HTMLElement the new launcher button element if created
     */
    static installMobileLauncherOverride(app, launcherConfig, onclickListener) {
        let qspLauncherButtonEl = null;
        // If it's not a mobile platform, or the override feature is disabled, or the
        // core launcher has already been overridden then do nothing.
        if (!obsidian.Platform.isMobile ||
            !launcherConfig.isEnabled ||
            MobileLauncher.coreMobileLauncherButtonEl) {
            return null;
        }
        const coreLauncherButtonEl = getCoreLauncherButtonElement(app, launcherConfig);
        if (coreLauncherButtonEl) {
            const qspButtonEl = createQSPLauncherButton(coreLauncherButtonEl, launcherConfig, onclickListener);
            if (replaceCoreLauncherButtonWithQSPButton(coreLauncherButtonEl, qspButtonEl)) {
                MobileLauncher.coreMobileLauncherButtonEl = coreLauncherButtonEl;
                MobileLauncher.qspMobileLauncherButtonEl = qspButtonEl;
                qspLauncherButtonEl = qspButtonEl;
            }
        }
        return qspLauncherButtonEl;
    }
    /**
     * Restores the default functionality of the "⊕" button on mobile platforms and
     * removes the custom launcher button.
     * @returns boolean true if successful
     */
    static removeMobileLauncherOverride() {
        let isSuccessful = false;
        if (!MobileLauncher.coreMobileLauncherButtonEl) {
            return isSuccessful;
        }
        if (MobileLauncher.qspMobileLauncherButtonEl?.parentElement) {
            const qspButtonEl = MobileLauncher.qspMobileLauncherButtonEl;
            const coreButtonEl = MobileLauncher.coreMobileLauncherButtonEl;
            const initialDisplay = coreButtonEl.style.display;
            coreButtonEl.style.display = 'none';
            if (qspButtonEl.insertAdjacentElement('beforebegin', coreButtonEl)) {
                qspButtonEl.remove();
                MobileLauncher.qspMobileLauncherButtonEl = null;
                MobileLauncher.coreMobileLauncherButtonEl = null;
                isSuccessful = true;
            }
            coreButtonEl.style.display = initialDisplay;
        }
        return isSuccessful;
    }
}

const COMMAND_DATA = [
    {
        id: 'switcher-plus:open',
        name: 'Open in Standard Mode',
        mode: Mode.Standard,
        iconId: 'lucide-file-search',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-editors',
        name: 'Open in Editor Mode',
        mode: Mode.EditorList,
        iconId: 'lucide-file-edit',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-symbols',
        name: 'Open Symbols for selected suggestion or editor',
        mode: Mode.SymbolList,
        iconId: 'lucide-dollar-sign',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-symbols-active',
        name: 'Open Symbols for the active editor',
        mode: Mode.SymbolList,
        iconId: 'lucide-dollar-sign',
        ribbonIconEl: null,
        sessionOpts: { useActiveEditorAsSource: true },
    },
    {
        id: 'switcher-plus:open-workspaces',
        name: 'Open in Workspaces Mode',
        mode: Mode.WorkspaceList,
        iconId: 'lucide-album',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-headings',
        name: 'Open in Headings Mode',
        mode: Mode.HeadingsList,
        iconId: 'lucide-file-search',
        ribbonIconEl: null,
    },
    {
        // Note: leaving this id with the old starred plugin name so that user
        // don't have to update their hotkey mappings when they upgrade
        id: 'switcher-plus:open-starred',
        name: 'Open in Bookmarks Mode',
        mode: Mode.BookmarksList,
        iconId: 'lucide-bookmark',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-commands',
        name: 'Open in Commands Mode',
        mode: Mode.CommandList,
        iconId: 'run-command',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-related-items',
        name: 'Open Related Items for selected suggestion or editor',
        mode: Mode.RelatedItemsList,
        iconId: 'lucide-file-plus-2',
        ribbonIconEl: null,
    },
    {
        id: 'switcher-plus:open-related-items-active',
        name: 'Open Related Items for the active editor',
        mode: Mode.RelatedItemsList,
        iconId: 'lucide-file-plus-2',
        ribbonIconEl: null,
        sessionOpts: { useActiveEditorAsSource: true },
    },
    {
        id: 'switcher-plus:open-vaults',
        name: 'Open in Vaults Mode',
        mode: Mode.VaultList,
        iconId: 'vault',
        ribbonIconEl: null,
    },
];
class SwitcherPlusPlugin extends obsidian.Plugin {
    async onload() {
        const options = new SwitcherPlusSettings(this);
        await options.updateDataAndLoadSettings();
        this.options = options;
        this.addSettingTab(new SwitcherPlusSettingTab(this.app, this, options));
        this.registerRibbonCommandIcons();
        this.updateMobileLauncherButtonOverride(options.mobileLauncher.isEnabled);
        COMMAND_DATA.forEach(({ id, name, mode, iconId, sessionOpts }) => {
            this.registerCommand(id, name, mode, iconId, sessionOpts);
        });
    }
    onunload() {
        this.updateMobileLauncherButtonOverride(false);
    }
    registerCommand(id, name, mode, iconId, sessionOpts) {
        this.addCommand({
            id,
            name,
            icon: iconId,
            checkCallback: (checking) => {
                return this.createModalAndOpen(mode, checking, sessionOpts);
            },
        });
    }
    registerRibbonCommandIcons() {
        // remove any registered icons
        COMMAND_DATA.forEach((data) => {
            data.ribbonIconEl?.remove();
            data.ribbonIconEl = null;
        });
        // map to keyed object
        const commandDataByMode = COMMAND_DATA.reduce((acc, curr) => {
            acc[curr.mode] = curr;
            return acc;
        }, {});
        this.options.enabledRibbonCommands.forEach((command) => {
            const data = commandDataByMode[Mode[command]];
            if (data) {
                data.ribbonIconEl = this.addRibbonIcon(data.iconId, data.name, () => {
                    this.createModalAndOpen(data.mode, false);
                });
            }
        });
    }
    createModalAndOpen(mode, isChecking, sessionOpts) {
        // modal needs to be created dynamically (same as system switcher)
        // as system options are evaluated in the modal constructor
        const modal = createSwitcherPlus(this.app, this);
        if (!modal) {
            return false;
        }
        if (!isChecking) {
            modal.openInMode(mode, sessionOpts);
        }
        return true;
    }
    updateMobileLauncherButtonOverride(isEnabled) {
        if (isEnabled) {
            const onclickListener = () => {
                const modeString = this.options.mobileLauncher.modeString;
                const openMode = Mode[modeString];
                if (openMode) {
                    this.createModalAndOpen(openMode, false);
                }
            };
            MobileLauncher.installMobileLauncherOverride(this.app, this.options.mobileLauncher, onclickListener);
        }
        else {
            MobileLauncher.removeMobileLauncherOverride();
        }
    }
}

module.exports = SwitcherPlusPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGVzL3NoYXJlZFR5cGVzLnRzIiwiLi4vLi4vc3JjL3V0aWxzL3V0aWxzLnRzIiwiLi4vLi4vc3JjL3V0aWxzL2Zyb250TWF0dGVyUGFyc2VyLnRzIiwiLi4vLi4vc3JjL3NldHRpbmdzL2ZhY2V0Q29uc3RhbnRzLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3RzLWRlZXBtZXJnZS9lc20vaW5kZXguanMiLCIuLi8uLi9zcmMvc2V0dGluZ3Mvc3dpdGNoZXJQbHVzU2V0dGluZ3MudHMiLCIuLi8uLi9zcmMvc2V0dGluZ3Mvc2V0dGluZ3NUYWJTZWN0aW9uLnRzIiwiLi4vLi4vc3JjL3NldHRpbmdzL2Jvb2ttYXJrc1NldHRpbmdzVGFiU2VjdGlvbi50cyIsIi4uLy4uL3NyYy9zZXR0aW5ncy9jb21tYW5kTGlzdFNldHRpbmdzVGFiU2VjdGlvbi50cyIsIi4uLy4uL3NyYy9zZXR0aW5ncy9yZWxhdGVkSXRlbXNTZXR0aW5nc1RhYlNlY3Rpb24udHMiLCIuLi8uLi9zcmMvc2V0dGluZ3MvZ2VuZXJhbFNldHRpbmdzVGFiU2VjdGlvbi50cyIsIi4uLy4uL3NyYy9zZXR0aW5ncy93b3Jrc3BhY2VTZXR0aW5nc1RhYlNlY3Rpb24udHMiLCIuLi8uLi9zcmMvc2V0dGluZ3MvZWRpdG9yU2V0dGluZ3NUYWJTZWN0aW9uLnRzIiwiLi4vLi4vc3JjL3NldHRpbmdzL2hlYWRpbmdzU2V0dGluZ3NUYWJTZWN0aW9uLnRzIiwiLi4vLi4vc3JjL3NldHRpbmdzL3N5bWJvbFNldHRpbmdzVGFiU2VjdGlvbi50cyIsIi4uLy4uL3NyYy9zZXR0aW5ncy92YXVsdExpc3RTZXR0aW5nc1RhYlNlY3Rpb24udHMiLCIuLi8uLi9zcmMvc2V0dGluZ3Mvc3dpdGNoZXJQbHVzU2V0dGluZ1RhYi50cyIsIi4uLy4uL3NyYy9zd2l0Y2hlclBsdXMvaW5wdXRJbmZvLnRzIiwiLi4vLi4vc3JjL0hhbmRsZXJzL2hhbmRsZXIudHMiLCIuLi8uLi9zcmMvSGFuZGxlcnMvd29ya3NwYWNlSGFuZGxlci50cyIsIi4uLy4uL3NyYy9IYW5kbGVycy9zdGFuZGFyZEV4SGFuZGxlci50cyIsIi4uLy4uL3NyYy9IYW5kbGVycy9lZGl0b3JIYW5kbGVyLnRzIiwiLi4vLi4vc3JjL0hhbmRsZXJzL2Jvb2ttYXJrc0hhbmRsZXIudHMiLCIuLi8uLi9zcmMvSGFuZGxlcnMvaGVhZGluZ3NIYW5kbGVyLnRzIiwiLi4vLi4vc3JjL0hhbmRsZXJzL3N5bWJvbEhhbmRsZXIudHMiLCIuLi8uLi9zcmMvSGFuZGxlcnMvY29tbWFuZEhhbmRsZXIudHMiLCIuLi8uLi9zcmMvSGFuZGxlcnMvcmVsYXRlZEl0ZW1zSGFuZGxlci50cyIsIi4uLy4uL3NyYy9IYW5kbGVycy92YXVsdEhhbmRsZXIudHMiLCIuLi8uLi9zcmMvc3dpdGNoZXJQbHVzL21vZGVIYW5kbGVyLnRzIiwiLi4vLi4vc3JjL3N3aXRjaGVyUGx1cy9zd2l0Y2hlclBsdXNLZXltYXAudHMiLCIuLi8uLi9zcmMvc3dpdGNoZXJQbHVzL3N3aXRjaGVyUGx1cy50cyIsIi4uLy4uL3NyYy9zd2l0Y2hlclBsdXMvbW9iaWxlTGF1bmNoZXIudHMiLCIuLi8uLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6bnVsbCwibmFtZXMiOlsicGFyc2VMaW5rdGV4dCIsIlNldHRpbmciLCJNb2RhbCIsIlBsdWdpblNldHRpbmdUYWIiLCJwcmVwYXJlUXVlcnkiLCJLZXltYXAiLCJQbGF0Zm9ybSIsInNldEljb24iLCJyZW5kZXJSZXN1bHRzIiwibm9ybWFsaXplUGF0aCIsImZ1enp5U2VhcmNoIiwiVmlldyIsIkZpbGVWaWV3Iiwic29ydFNlYXJjaFJlc3VsdHMiLCJpcGNSZW5kZXJlciIsImRlYm91bmNlIiwiTWFya2Rvd25WaWV3IiwiUGx1Z2luIl0sIm1hcHBpbmdzIjoiOzs7OztBQTBCQSxJQUFZLGlCQU1YLENBQUE7QUFORCxDQUFBLFVBQVksaUJBQWlCLEVBQUE7QUFDM0IsSUFBQSxpQkFBQSxDQUFBLGlCQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsTUFBSSxDQUFBO0FBQ0osSUFBQSxpQkFBQSxDQUFBLGlCQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsTUFBSSxDQUFBO0FBQ0osSUFBQSxpQkFBQSxDQUFBLGlCQUFBLENBQUEsWUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsWUFBVSxDQUFBO0FBQ1YsSUFBQSxpQkFBQSxDQUFBLGlCQUFBLENBQUEsb0JBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLG9CQUFrQixDQUFBO0FBQ2xCLElBQUEsaUJBQUEsQ0FBQSxpQkFBQSxDQUFBLDRCQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSw0QkFBMEIsQ0FBQTtBQUM1QixDQUFDLEVBTlcsaUJBQWlCLEtBQWpCLGlCQUFpQixHQU01QixFQUFBLENBQUEsQ0FBQSxDQUFBO0FBRUQsSUFBWSxJQVVYLENBQUE7QUFWRCxDQUFBLFVBQVksSUFBSSxFQUFBO0FBQ2QsSUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFVBQVksQ0FBQTtBQUNaLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxZQUFjLENBQUE7QUFDZCxJQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsWUFBYyxDQUFBO0FBQ2QsSUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLGVBQWlCLENBQUE7QUFDakIsSUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLGNBQWlCLENBQUE7QUFDakIsSUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGVBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLGVBQWtCLENBQUE7QUFDbEIsSUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLGFBQWdCLENBQUE7QUFDaEIsSUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGtCQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsR0FBQSxrQkFBc0IsQ0FBQTtBQUN0QixJQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBLEdBQUEsV0FBZSxDQUFBO0FBQ2pCLENBQUMsRUFWVyxJQUFJLEtBQUosSUFBSSxHQVVmLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFFRCxJQUFZLFVBT1gsQ0FBQTtBQVBELENBQUEsVUFBWSxVQUFVLEVBQUE7QUFDcEIsSUFBQSxVQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLE1BQVEsQ0FBQTtBQUNSLElBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxPQUFTLENBQUE7QUFDVCxJQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsS0FBTyxDQUFBO0FBQ1AsSUFBQSxVQUFBLENBQUEsVUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFNBQVcsQ0FBQTtBQUNYLElBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsR0FBQSxTQUFZLENBQUE7QUFDWixJQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsWUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLEdBQUEsWUFBZSxDQUFBO0FBQ2pCLENBQUMsRUFQVyxVQUFVLEtBQVYsVUFBVSxHQU9yQixFQUFBLENBQUEsQ0FBQSxDQUFBO0FBRUQsSUFBWSxRQUtYLENBQUE7QUFMRCxDQUFBLFVBQVksUUFBUSxFQUFBO0FBQ2xCLElBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxNQUFRLENBQUE7QUFDUixJQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsUUFBVSxDQUFBO0FBQ1YsSUFBQSxRQUFBLENBQUEsUUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLFNBQVcsQ0FBQTtBQUNYLElBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxPQUFTLENBQUE7QUFDWCxDQUFDLEVBTFcsUUFBUSxLQUFSLFFBQVEsR0FLbkIsRUFBQSxDQUFBLENBQUEsQ0FBQTtBQU1NLE1BQU0sZ0JBQWdCLEdBQXdCLEVBQUUsQ0FBQztBQUN4RCxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3pDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDekMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN2QyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBTXBDLE1BQU0saUJBQWlCLEdBQW9DLEVBQUUsQ0FBQztBQUNyRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDNUIsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzVCLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUM1QixpQkFBaUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDNUIsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzVCLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQXNENUIsSUFBWSxjQVlYLENBQUE7QUFaRCxDQUFBLFVBQVksY0FBYyxFQUFBO0FBQ3hCLElBQUEsY0FBQSxDQUFBLFlBQUEsQ0FBQSxHQUFBLFlBQXlCLENBQUE7QUFDekIsSUFBQSxjQUFBLENBQUEsWUFBQSxDQUFBLEdBQUEsWUFBeUIsQ0FBQTtBQUN6QixJQUFBLGNBQUEsQ0FBQSxlQUFBLENBQUEsR0FBQSxlQUErQixDQUFBO0FBQy9CLElBQUEsY0FBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLGNBQTZCLENBQUE7QUFDN0IsSUFBQSxjQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsVUFBcUIsQ0FBQTtBQUNyQixJQUFBLGNBQUEsQ0FBQSxhQUFBLENBQUEsR0FBQSxhQUEyQixDQUFBO0FBQzNCLElBQUEsY0FBQSxDQUFBLGtCQUFBLENBQUEsR0FBQSxrQkFBcUMsQ0FBQTtBQUNyQyxJQUFBLGNBQUEsQ0FBQSxXQUFBLENBQUEsR0FBQSxXQUF1QixDQUFBO0FBQ3ZCLElBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLE1BQWEsQ0FBQTtBQUNiLElBQUEsY0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLE9BQWUsQ0FBQTtBQUNmLElBQUEsY0FBQSxDQUFBLFlBQUEsQ0FBQSxHQUFBLFlBQXlCLENBQUE7QUFDM0IsQ0FBQyxFQVpXLGNBQWMsS0FBZCxjQUFjLEdBWXpCLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFFRCxJQUFZLFNBS1gsQ0FBQTtBQUxELENBQUEsVUFBWSxTQUFTLEVBQUE7QUFDbkIsSUFBQSxTQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLE1BQVEsQ0FBQTtBQUNSLElBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxTQUFPLENBQUE7QUFDUCxJQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsVUFBUSxDQUFBO0FBQ1IsSUFBQSxTQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLE1BQUksQ0FBQTtBQUNOLENBQUMsRUFMVyxTQUFTLEtBQVQsU0FBUyxHQUtwQixFQUFBLENBQUEsQ0FBQSxDQUFBO0FBc0NELElBQVksWUFJWCxDQUFBO0FBSkQsQ0FBQSxVQUFZLFlBQVksRUFBQTtBQUN0QixJQUFBLFlBQUEsQ0FBQSxjQUFBLENBQUEsR0FBQSxlQUE4QixDQUFBO0FBQzlCLElBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxHQUFBLFVBQXFCLENBQUE7QUFDckIsSUFBQSxZQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsZUFBOEIsQ0FBQTtBQUNoQyxDQUFDLEVBSlcsWUFBWSxLQUFaLFlBQVksR0FJdkIsRUFBQSxDQUFBLENBQUE7O1NDdktlLFFBQVEsQ0FDdEIsR0FBWSxFQUNaLGFBQXNCLEVBQ3RCLEdBQWEsRUFBQTtJQUViLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQztJQUVoQixJQUFJLEdBQUcsSUFBSyxHQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssU0FBUyxFQUFFO1FBQ2xELEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDWCxJQUFJLEdBQUcsS0FBSyxTQUFTLElBQUksR0FBRyxLQUFLLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUNuRCxHQUFHLEdBQUcsS0FBSyxDQUFDO1NBQ2I7S0FDRjtBQUVELElBQUEsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUssU0FBVSxrQkFBa0IsQ0FBQyxHQUFZLEVBQUE7SUFDN0MsT0FBTyxRQUFRLENBQW1CLEdBQUcsRUFBRSxNQUFNLEVBQUUsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzVFLENBQUM7QUFFSyxTQUFVLGtCQUFrQixDQUFDLEdBQVksRUFBQTtJQUM3QyxPQUFPLFFBQVEsQ0FBbUIsR0FBRyxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUUsQ0FBQztBQUVLLFNBQVUsbUJBQW1CLENBQUMsR0FBWSxFQUFBO0lBQzlDLE9BQU8sUUFBUSxDQUFvQixHQUFHLEVBQUUsTUFBTSxFQUFFLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMvRSxDQUFDO0FBRUssU0FBVSxnQkFBZ0IsQ0FBQyxHQUFZLEVBQUE7SUFDM0MsT0FBTyxRQUFRLENBQWlCLEdBQUcsRUFBRSxNQUFNLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BFLENBQUM7QUFFSyxTQUFVLGlCQUFpQixDQUFDLEdBQVksRUFBQTtJQUM1QyxPQUFPLFFBQVEsQ0FBa0IsR0FBRyxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEUsQ0FBQztBQUVLLFNBQVUsc0JBQXNCLENBQUMsR0FBWSxFQUFBO0lBQ2pELE9BQU8sUUFBUSxDQUF1QixHQUFHLEVBQUUsTUFBTSxFQUFFLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoRixDQUFDO0FBRUssU0FBVSxrQkFBa0IsQ0FBQyxHQUFZLEVBQUE7QUFDN0MsSUFBQSxPQUFPLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hGLENBQUM7QUFFSyxTQUFVLGNBQWMsQ0FBQyxJQUFtQixFQUFBO0FBQ2hELElBQUEsT0FBTyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRUssU0FBVSxjQUFjLENBQUMsR0FBWSxFQUFBO0FBQ3pDLElBQUEsT0FBTyxRQUFRLENBQWUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFFSyxTQUFVLFVBQVUsQ0FBQyxHQUFZLEVBQUE7QUFDckMsSUFBQSxPQUFPLFFBQVEsQ0FBVyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUVLLFNBQVUsY0FBYyxDQUFDLEdBQVksRUFBQTtJQUN6QyxPQUFPLFFBQVEsQ0FBZSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFFSyxTQUFVLE9BQU8sQ0FBQyxHQUFZLEVBQUE7QUFDbEMsSUFBQSxPQUFPLFFBQVEsQ0FBUSxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUVLLFNBQVUsWUFBWSxDQUFDLEdBQVcsRUFBQTtJQUN0QyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDcEQsQ0FBQztBQUVlLFNBQUEscUJBQXFCLENBQUMsR0FBUSxFQUFFLEVBQVUsRUFBQTtJQUN4RCxPQUFPLEdBQUcsRUFBRSxlQUFlLEVBQUUsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUFFZSxTQUFBLDRCQUE0QixDQUFDLEdBQVEsRUFBRSxFQUFVLEVBQUE7SUFDL0QsT0FBTyxHQUFHLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFFSyxTQUFVLHlCQUF5QixDQUFDLEdBQVEsRUFBQTtJQUNoRCxNQUFNLE1BQU0sR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEQsT0FBTyxNQUFNLEVBQUUsUUFBdUMsQ0FBQztBQUN6RCxDQUFDO0FBQ0Q7O0FBRUc7U0FDYSxZQUFZLEdBQUE7QUFDMUIsSUFBQSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3ZCLFNBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixTQUFBLElBQUksRUFBOEIsQ0FBQztBQUN4QyxDQUFDO0FBRUssU0FBVSx3QkFBd0IsQ0FBQyxJQUFXLEVBQUE7SUFDbEQsSUFBSSxNQUFNLEdBQVcsSUFBSSxDQUFDO0lBRTFCLElBQUksSUFBSSxFQUFFO0FBQ1IsUUFBQSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFFZCxRQUFBLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUVwQyxZQUFBLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO2dCQUM1RCxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDL0I7U0FDRjtLQUNGO0FBRUQsSUFBQSxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUssU0FBVSxnQkFBZ0IsQ0FBQyxJQUFZLEVBQUE7SUFDM0MsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBRWxCLElBQUksSUFBSSxFQUFFO1FBQ1IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQyxNQUFNLEdBQUcsS0FBSyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztLQUN0RDtBQUVELElBQUEsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVLLFNBQVUscUJBQXFCLENBQ25DLFlBQXNCLEVBQUE7QUFFdEIsSUFBQSxZQUFZLEdBQUcsWUFBWSxJQUFJLEVBQUUsQ0FBQztJQUNsQyxNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUM7QUFFL0IsSUFBQSxLQUFLLE1BQU0sR0FBRyxJQUFJLFlBQVksRUFBRTtBQUM5QixRQUFBLElBQUk7QUFDRixZQUFBLE1BQU0sRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFlBQUEsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNwQjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBLCtDQUFBLEVBQWtELEdBQUcsQ0FBRSxDQUFBLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDM0U7S0FDRjtBQUVELElBQUEsTUFBTSxTQUFTLEdBQStCLENBQUMsS0FBSyxLQUFJO0FBQ3RELFFBQUEsS0FBSyxNQUFNLEVBQUUsSUFBSSxTQUFTLEVBQUU7QUFDMUIsWUFBQSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDbEIsZ0JBQUEsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO0FBRUQsUUFBQSxPQUFPLEtBQUssQ0FBQztBQUNmLEtBQUMsQ0FBQztBQUVGLElBQUEsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQztBQUVLLFNBQVUsV0FBVyxDQUFDLFNBQW9CLEVBQUE7QUFDOUMsSUFBQSxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO0lBRXpCLElBQUksU0FBUyxFQUFFOztBQUViLFFBQUEsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFN0MsUUFBQSxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDMUIsWUFBQSxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztTQUN2QjtBQUFNLGFBQUEsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2hDLFlBQUEsSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7U0FDekI7YUFBTTtBQUNMLFlBQUEsSUFBSSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7U0FDeEI7S0FDRjtBQUVELElBQUEsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQ7Ozs7OztBQU1HO0FBQ2EsU0FBQSxjQUFjLENBQUMsSUFBWSxFQUFFLEtBQVksRUFBQTtJQUN2RCxJQUFJLElBQUksR0FBVSxJQUFJLENBQUM7SUFDdkIsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBRXZELElBQUEsSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7UUFDekIsSUFBSSxHQUFHLFlBQVksQ0FBQztLQUNyQjtBQUVELElBQUEsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUssU0FBVSxvQkFBb0IsQ0FDbEMsV0FBd0IsRUFDeEIsS0FBWSxFQUNaLElBQW1CLEVBQ25CLFVBQWtCLEVBQ2xCLE9BQXVFLEVBQUE7SUFFdkUsSUFBSSxPQUFPLEdBQVcsSUFBSSxDQUFDO0FBQzNCLElBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFeEYsSUFBSSxJQUFJLEVBQUU7QUFDUixRQUFBLElBQUksUUFBUSxHQUFHLCtCQUErQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFFbkIsUUFBQSxRQUFRLElBQUksQ0FBQyxJQUFJO1lBQ2YsS0FBSyxjQUFjLENBQUMsVUFBVTtBQUM1QixnQkFBQSxPQUFPLEdBQUcsaUNBQWlDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMzRCxNQUFNO1lBQ1IsS0FBSyxjQUFjLENBQUMsS0FBSztBQUN2QixnQkFBQSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDbkIsTUFBTTtBQUNSLFlBQUEsS0FBSyxjQUFjLENBQUMsUUFBUSxFQUFFO0FBQzVCLGdCQUFBLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUN0QyxvQkFBQSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztpQkFDcEI7Z0JBQ0QsTUFBTTthQUNQO0FBQ0QsWUFBQSxLQUFLLGNBQWMsQ0FBQyxZQUFZLEVBQUU7QUFDaEMsZ0JBQUEsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDOUIsZ0JBQUEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyw0QkFBNEIsQ0FDaEQsT0FBTyxFQUNQLE9BQU8sQ0FBQyxpQkFBaUIsQ0FDMUIsRUFBRTtnQkFDSCxNQUFNO2FBQ1A7QUFDRCxZQUFBLEtBQUssY0FBYyxDQUFDLFVBQVUsRUFBRTtnQkFDOUIsTUFBTSxFQUNKLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUNqQixHQUFHLElBQUksQ0FBQztBQUVULGdCQUFBLElBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzFCLG9CQUFBLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsNEJBQTRCLENBQ2hELE1BQU0sQ0FBQyxPQUFPLEVBQ2QsT0FBTyxDQUFDLGlCQUFpQixDQUMxQixFQUFFO2lCQUNKO0FBQU0scUJBQUEsSUFBSSxRQUFRLENBQWlCLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRTs7QUFFbkQsb0JBQUEsTUFBTSxjQUFjLEdBQUcsSUFBSSxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUUvRSxJQUFJLGNBQWMsRUFBRTtBQUNsQix3QkFBQSxPQUFPLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztxQkFDM0I7eUJBQU07QUFDTCx3QkFBQSxPQUFPLEdBQUcscUNBQXFDLENBQzdDLFdBQVcsRUFDWCxLQUFLLEVBQ0wsVUFBVSxFQUNWLE1BQU0sRUFDTixRQUFRLEVBQ1IsT0FBTyxDQUFDLGtCQUFrQixDQUMzQixDQUFDO3FCQUNIO2lCQUNGO3FCQUFNOztvQkFFTCxRQUFRLEdBQUcsSUFBSSxDQUFDO2lCQUNqQjtnQkFDRCxNQUFNO2FBQ1A7QUFDRCxZQUFBLEtBQUssY0FBYyxDQUFDLGdCQUFnQixFQUFFO0FBQ3BDLGdCQUFBLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDdEIsZ0JBQUEsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3ZCLG9CQUFBLE9BQU8sR0FBRyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7aUJBQ2xFO2dCQUNELE1BQU07YUFDUDtTQUNGO0FBRUQsUUFBQSxJQUFJLFFBQVEsSUFBSSxDQUFDLE9BQU8sRUFBRTs7QUFFeEIsWUFBQSxJQUFJLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRTtBQUN4QyxnQkFBQSxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQzthQUMzQjtBQUVELFlBQUEsT0FBTyxHQUFHLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNsRjtLQUNGO0FBRUQsSUFBQSxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRUQsU0FBUyw0QkFBNEIsQ0FDbkMsS0FBYSxFQUNiLGVBQXdCLEVBQUE7O0lBR3hCLE1BQU0scUJBQXFCLEdBQUcsNEJBQTRCLENBQUM7SUFDM0QsTUFBTSxjQUFjLEdBQUcsS0FBSztBQUN6QixTQUFBLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLENBQUM7QUFDbkMsU0FBQSxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztBQUNwQixTQUFBLElBQUksRUFBRSxDQUFDO0lBRVYsT0FBTztRQUNMLE9BQU8sRUFBRSxDQUFJLENBQUEsRUFBQSxjQUFjLENBQUUsQ0FBQTtRQUM3QixLQUFLLEVBQUUsZUFBZSxHQUFHLGNBQWMsR0FBRyxJQUFJO0tBQy9DLENBQUM7QUFDSixDQUFDO0FBRUQ7Ozs7O0FBS0c7QUFDSCxTQUFTLCtCQUErQixDQUFDLElBQW1CLEVBQUE7SUFDMUQsSUFBSSxRQUFRLEdBQVUsSUFBSSxDQUFDO0FBQzNCLElBQUEsTUFBTSxhQUFhLEdBQUc7QUFDcEIsUUFBQSxjQUFjLENBQUMsS0FBSztBQUNwQixRQUFBLGNBQWMsQ0FBQyxRQUFRO0FBQ3ZCLFFBQUEsY0FBYyxDQUFDLFlBQVk7QUFDM0IsUUFBQSxjQUFjLENBQUMsVUFBVTtBQUN6QixRQUFBLGNBQWMsQ0FBQyxnQkFBZ0I7QUFDL0IsUUFBQSxjQUFjLENBQUMsVUFBVTtBQUN6QixRQUFBLGNBQWMsQ0FBQyxJQUFJO0tBQ3BCLENBQUM7SUFFRixJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFOztBQUVyQyxRQUFBLFFBQVEsR0FBSSxJQUF3QixDQUFDLElBQUksQ0FBQztLQUMzQztBQUVELElBQUEsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQUVELFNBQVMsaUNBQWlDLENBQUMsSUFBWSxFQUFFLFdBQW9CLEVBQUE7QUFDM0UsSUFBQSxXQUFXLEdBQUcsV0FBVyxFQUFFLE1BQU0sR0FBRyxDQUFJLENBQUEsRUFBQSxXQUFXLENBQUUsQ0FBQSxHQUFHLEVBQUUsQ0FBQztBQUMzRCxJQUFBLE9BQU8sQ0FBSyxFQUFBLEVBQUEsSUFBSSxDQUFHLEVBQUEsV0FBVyxJQUFJLENBQUM7QUFDckMsQ0FBQztBQUVELFNBQVMscUNBQXFDLENBQzVDLFdBQXdCLEVBQ3hCLEtBQVksRUFDWixVQUFrQixFQUNsQixRQUF3QixFQUN4QixrQkFBeUIsRUFDekIsa0JBQTJCLEVBQUE7QUFFM0IsSUFBQSxNQUFNLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxHQUFHLFFBQVEsQ0FBQztJQUN2QyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHQSxzQkFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlDLElBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQztJQUN4QixJQUFJLFFBQVEsR0FBVSxJQUFJLENBQUM7SUFDM0IsSUFBSSxPQUFPLEdBQVcsSUFBSSxDQUFDO0FBRTNCLElBQUEsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7OztRQUdqQixRQUFRLEdBQUcsa0JBQWtCLENBQUM7S0FDL0I7U0FBTTtBQUNMLFFBQUEsUUFBUSxHQUFHLGNBQWMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDeEM7SUFFRCxJQUFJLFFBQVEsRUFBRTtBQUNaLFFBQUEsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLElBQUksa0JBQWtCLEVBQUU7QUFDeEMsWUFBQSxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztTQUMzQjtBQUVELFFBQUEsT0FBTyxHQUFHLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNsRjtTQUFNO0FBQ0wsUUFBQSxPQUFPLEdBQUcsaUNBQWlDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzFEO0FBRUQsSUFBQSxPQUFPLE9BQU8sQ0FBQztBQUNqQjs7TUNqWWEsaUJBQWlCLENBQUE7SUFDNUIsT0FBTyxVQUFVLENBQUMsV0FBNkIsRUFBQTtRQUM3QyxJQUFJLE9BQU8sR0FBYSxFQUFFLENBQUM7UUFFM0IsSUFBSSxXQUFXLEVBQUU7WUFDZixPQUFPLEdBQUcsaUJBQWlCLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxlQUFlLENBQUMsQ0FBQztTQUMxRTtBQUVELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7QUFFTyxJQUFBLE9BQU8sY0FBYyxDQUMzQixXQUE2QixFQUM3QixVQUFrQixFQUFBO1FBRWxCLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3hDLFFBQUEsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFdkQsSUFBSSxHQUFHLEVBQUU7O0FBRVAsWUFBQSxJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFN0IsWUFBQSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtBQUM3QixnQkFBQSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUMxQjtBQUVELFlBQUEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3hCLGdCQUFBLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEtBQUk7QUFDcEIsb0JBQUEsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7d0JBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7cUJBQ3pCO0FBQ0gsaUJBQUMsQ0FBQyxDQUFDO2FBQ0o7U0FDRjtBQUVELFFBQUEsT0FBTyxNQUFNLENBQUM7S0FDZjtBQUNGOztBQ3RDRDtBQUNPLE1BQU0sd0JBQXdCLEdBQTJCO0FBQzlELElBQUEsSUFBSSxFQUFFLGtCQUFrQjtBQUN4QixJQUFBLElBQUksRUFBRSxrQkFBa0I7QUFDeEIsSUFBQSxJQUFJLEVBQUUsa0JBQWtCO0FBQ3hCLElBQUEsS0FBSyxFQUFFLG1CQUFtQjtDQUMzQixDQUFDO0FBRUssTUFBTSxrQkFBa0IsR0FBWTtBQUN6QyxJQUFBO0FBQ0UsUUFBQSxFQUFFLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFDbEMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVO0FBQ3JCLFFBQUEsS0FBSyxFQUFFLFVBQVU7QUFDakIsUUFBQSxRQUFRLEVBQUUsS0FBSztBQUNmLFFBQUEsV0FBVyxFQUFFLElBQUk7QUFDbEIsS0FBQTtBQUNELElBQUE7QUFDRSxRQUFBLEVBQUUsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztRQUM5QixJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVU7QUFDckIsUUFBQSxLQUFLLEVBQUUsTUFBTTtBQUNiLFFBQUEsUUFBUSxFQUFFLEtBQUs7QUFDZixRQUFBLFdBQVcsRUFBRSxJQUFJO0FBQ2xCLEtBQUE7QUFDRCxJQUFBO0FBQ0UsUUFBQSxFQUFFLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFDbEMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVO0FBQ3JCLFFBQUEsS0FBSyxFQUFFLFVBQVU7QUFDakIsUUFBQSxRQUFRLEVBQUUsS0FBSztBQUNmLFFBQUEsV0FBVyxFQUFFLElBQUk7QUFDbEIsS0FBQTtBQUNELElBQUE7QUFDRSxRQUFBLEVBQUUsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztRQUMvQixJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVU7QUFDckIsUUFBQSxLQUFLLEVBQUUsT0FBTztBQUNkLFFBQUEsUUFBUSxFQUFFLEtBQUs7QUFDZixRQUFBLFdBQVcsRUFBRSxJQUFJO0FBQ2xCLEtBQUE7QUFDRCxJQUFBO0FBQ0UsUUFBQSxFQUFFLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFDaEMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVO0FBQ3JCLFFBQUEsS0FBSyxFQUFFLFFBQVE7QUFDZixRQUFBLFFBQVEsRUFBRSxLQUFLO0FBQ2YsUUFBQSxXQUFXLEVBQUUsSUFBSTtBQUNsQixLQUFBO0FBQ0QsSUFBQTtRQUNFLEVBQUUsRUFBRSx3QkFBd0IsQ0FBQyxJQUFJO1FBQ2pDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVTtBQUNyQixRQUFBLEtBQUssRUFBRSxZQUFZO0FBQ25CLFFBQUEsUUFBUSxFQUFFLEtBQUs7QUFDZixRQUFBLFdBQVcsRUFBRSxJQUFJO0FBQ2xCLEtBQUE7QUFDRCxJQUFBO1FBQ0UsRUFBRSxFQUFFLHdCQUF3QixDQUFDLElBQUk7UUFDakMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVO0FBQ3JCLFFBQUEsS0FBSyxFQUFFLFlBQVk7QUFDbkIsUUFBQSxRQUFRLEVBQUUsS0FBSztBQUNmLFFBQUEsV0FBVyxFQUFFLElBQUk7QUFDbEIsS0FBQTtBQUNELElBQUE7UUFDRSxFQUFFLEVBQUUsd0JBQXdCLENBQUMsSUFBSTtRQUNqQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVU7QUFDckIsUUFBQSxLQUFLLEVBQUUsWUFBWTtBQUNuQixRQUFBLFFBQVEsRUFBRSxLQUFLO0FBQ2YsUUFBQSxXQUFXLEVBQUUsSUFBSTtBQUNsQixLQUFBO0FBQ0QsSUFBQTtRQUNFLEVBQUUsRUFBRSx3QkFBd0IsQ0FBQyxLQUFLO1FBQ2xDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVTtBQUNyQixRQUFBLEtBQUssRUFBRSxRQUFRO0FBQ2YsUUFBQSxRQUFRLEVBQUUsS0FBSztBQUNmLFFBQUEsV0FBVyxFQUFFLElBQUk7QUFDbEIsS0FBQTtDQUNGLENBQUM7QUFFSyxNQUFNLHlCQUF5QixHQUFZO0FBQ2hELElBQUE7UUFDRSxFQUFFLEVBQUUsWUFBWSxDQUFDLFFBQVE7UUFDekIsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0I7QUFDM0IsUUFBQSxLQUFLLEVBQUUsV0FBVztBQUNsQixRQUFBLFFBQVEsRUFBRSxLQUFLO0FBQ2YsUUFBQSxXQUFXLEVBQUUsSUFBSTtBQUNsQixLQUFBO0FBQ0QsSUFBQTtRQUNFLEVBQUUsRUFBRSxZQUFZLENBQUMsWUFBWTtRQUM3QixJQUFJLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtBQUMzQixRQUFBLEtBQUssRUFBRSxnQkFBZ0I7QUFDdkIsUUFBQSxRQUFRLEVBQUUsS0FBSztBQUNmLFFBQUEsV0FBVyxFQUFFLElBQUk7QUFDbEIsS0FBQTtBQUNELElBQUE7UUFDRSxFQUFFLEVBQUUsWUFBWSxDQUFDLFlBQVk7UUFDN0IsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0I7QUFDM0IsUUFBQSxLQUFLLEVBQUUsZUFBZTtBQUN0QixRQUFBLFFBQVEsRUFBRSxLQUFLO0FBQ2YsUUFBQSxXQUFXLEVBQUUsSUFBSTtBQUNsQixLQUFBO0NBQ0YsQ0FBQztBQUVLLE1BQU0sc0JBQXNCLEdBQTJCO0FBQzVELElBQUEsSUFBSSxFQUFFLGdCQUFnQjtBQUN0QixJQUFBLE1BQU0sRUFBRSxrQkFBa0I7QUFDMUIsSUFBQSxNQUFNLEVBQUUsa0JBQWtCO0FBQzFCLElBQUEsS0FBSyxFQUFFLGlCQUFpQjtDQUN6QixDQUFDO0FBRUssTUFBTSxxQkFBcUIsR0FBWTtBQUM1QyxJQUFBO1FBQ0UsRUFBRSxFQUFFLHNCQUFzQixDQUFDLElBQUk7UUFDL0IsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhO0FBQ3hCLFFBQUEsS0FBSyxFQUFFLE9BQU87QUFDZCxRQUFBLFFBQVEsRUFBRSxLQUFLO0FBQ2YsUUFBQSxXQUFXLEVBQUUsSUFBSTtBQUNsQixLQUFBO0FBQ0QsSUFBQTtRQUNFLEVBQUUsRUFBRSxzQkFBc0IsQ0FBQyxNQUFNO1FBQ2pDLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYTtBQUN4QixRQUFBLEtBQUssRUFBRSxTQUFTO0FBQ2hCLFFBQUEsUUFBUSxFQUFFLEtBQUs7QUFDZixRQUFBLFdBQVcsRUFBRSxJQUFJO0FBQ2xCLEtBQUE7QUFDRCxJQUFBO1FBQ0UsRUFBRSxFQUFFLHNCQUFzQixDQUFDLE1BQU07UUFDakMsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhO0FBQ3hCLFFBQUEsS0FBSyxFQUFFLFVBQVU7QUFDakIsUUFBQSxRQUFRLEVBQUUsS0FBSztBQUNmLFFBQUEsV0FBVyxFQUFFLElBQUk7QUFDbEIsS0FBQTtDQUNGLENBQUM7QUFFRixJQUFZLG1CQUdYLENBQUE7QUFIRCxDQUFBLFVBQVksbUJBQW1CLEVBQUE7QUFDN0IsSUFBQSxtQkFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLGdCQUF5QixDQUFBO0FBQ3pCLElBQUEsbUJBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxnQkFBeUIsQ0FBQTtBQUMzQixDQUFDLEVBSFcsbUJBQW1CLEtBQW5CLG1CQUFtQixHQUc5QixFQUFBLENBQUEsQ0FBQSxDQUFBO0FBRU0sTUFBTSxtQkFBbUIsR0FBWTtBQUMxQyxJQUFBO1FBQ0UsRUFBRSxFQUFFLG1CQUFtQixDQUFDLE1BQU07UUFDOUIsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXO0FBQ3RCLFFBQUEsS0FBSyxFQUFFLFFBQVE7QUFDZixRQUFBLFFBQVEsRUFBRSxLQUFLO0FBQ2YsUUFBQSxXQUFXLEVBQUUsSUFBSTtBQUNsQixLQUFBO0FBQ0QsSUFBQTtRQUNFLEVBQUUsRUFBRSxtQkFBbUIsQ0FBQyxNQUFNO1FBQzlCLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVztBQUN0QixRQUFBLEtBQUssRUFBRSxRQUFRO0FBQ2YsUUFBQSxRQUFRLEVBQUUsS0FBSztBQUNmLFFBQUEsV0FBVyxFQUFFLElBQUk7QUFDbEIsS0FBQTtDQUNGLENBQUM7QUFFRixJQUFZLG9CQU1YLENBQUE7QUFORCxDQUFBLFVBQVksb0JBQW9CLEVBQUE7QUFDOUIsSUFBQSxvQkFBQSxDQUFBLGFBQUEsQ0FBQSxHQUFBLG1CQUFpQyxDQUFBO0FBQ2pDLElBQUEsb0JBQUEsQ0FBQSxXQUFBLENBQUEsR0FBQSxpQkFBNkIsQ0FBQTtBQUM3QixJQUFBLG9CQUFBLENBQUEsV0FBQSxDQUFBLEdBQUEsaUJBQTZCLENBQUE7QUFDN0IsSUFBQSxvQkFBQSxDQUFBLFVBQUEsQ0FBQSxHQUFBLGdCQUEyQixDQUFBO0FBQzNCLElBQUEsb0JBQUEsQ0FBQSxlQUFBLENBQUEsR0FBQSxxQkFBcUMsQ0FBQTtBQUN2QyxDQUFDLEVBTlcsb0JBQW9CLEtBQXBCLG9CQUFvQixHQU0vQixFQUFBLENBQUEsQ0FBQSxDQUFBO0FBRU0sTUFBTSxvQkFBb0IsR0FBWTtBQUMzQyxJQUFBO1FBQ0UsRUFBRSxFQUFFLG9CQUFvQixDQUFDLFdBQVc7UUFDcEMsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZO0FBQ3ZCLFFBQUEsS0FBSyxFQUFFLGNBQWM7QUFDckIsUUFBQSxRQUFRLEVBQUUsS0FBSztBQUNmLFFBQUEsV0FBVyxFQUFFLElBQUk7QUFDbEIsS0FBQTtBQUNELElBQUE7UUFDRSxFQUFFLEVBQUUsb0JBQW9CLENBQUMsU0FBUztRQUNsQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVk7QUFDdkIsUUFBQSxLQUFLLEVBQUUsV0FBVztBQUNsQixRQUFBLFFBQVEsRUFBRSxLQUFLO0FBQ2YsUUFBQSxXQUFXLEVBQUUsSUFBSTtBQUNsQixLQUFBO0FBQ0QsSUFBQTtRQUNFLEVBQUUsRUFBRSxvQkFBb0IsQ0FBQyxTQUFTO1FBQ2xDLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWTtBQUN2QixRQUFBLEtBQUssRUFBRSxXQUFXO0FBQ2xCLFFBQUEsUUFBUSxFQUFFLEtBQUs7QUFDZixRQUFBLFdBQVcsRUFBRSxJQUFJO0FBQ2xCLEtBQUE7QUFDRCxJQUFBO1FBQ0UsRUFBRSxFQUFFLG9CQUFvQixDQUFDLFFBQVE7UUFDakMsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZO0FBQ3ZCLFFBQUEsS0FBSyxFQUFFLFVBQVU7QUFDakIsUUFBQSxRQUFRLEVBQUUsS0FBSztBQUNmLFFBQUEsV0FBVyxFQUFFLElBQUk7QUFDbEIsS0FBQTtBQUNELElBQUE7UUFDRSxFQUFFLEVBQUUsb0JBQW9CLENBQUMsYUFBYTtRQUN0QyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVk7QUFDdkIsUUFBQSxLQUFLLEVBQUUsZ0JBQWdCO0FBQ3ZCLFFBQUEsUUFBUSxFQUFFLEtBQUs7QUFDZixRQUFBLFdBQVcsRUFBRSxJQUFJO0FBQ2xCLEtBQUE7Q0FDRixDQUFDO1NBRWMsV0FBVyxHQUFBO0lBQ3pCLE1BQU0sUUFBUSxHQUEwQixFQUFFLENBQUM7QUFDM0MsSUFBQSxNQUFNLFVBQVUsR0FBRztRQUNqQixrQkFBa0I7UUFDbEIseUJBQXlCO1FBQ3pCLHFCQUFxQjtRQUNyQixtQkFBbUI7UUFDbkIsb0JBQW9CO0tBQ3JCLENBQUM7SUFFRixVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssS0FBSTtBQUMzQyxRQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDOUMsUUFBQSxPQUFPLFFBQVEsQ0FBQztLQUNqQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBRWIsSUFBQSxPQUFPLFFBQVEsQ0FBQztBQUNsQjs7QUN2TkE7QUFDQSxNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQUcsS0FBSztBQUMxQixJQUFJLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUU7QUFDakQsUUFBUSxJQUFJLE9BQU8sTUFBTSxDQUFDLGNBQWMsS0FBSyxVQUFVLEVBQUU7QUFDekQsWUFBWSxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELFlBQVksT0FBTyxTQUFTLEtBQUssTUFBTSxDQUFDLFNBQVMsSUFBSSxTQUFTLEtBQUssSUFBSSxDQUFDO0FBQ3hFLFNBQVM7QUFDVCxRQUFRLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLGlCQUFpQixDQUFDO0FBQ3pFLEtBQUs7QUFDTCxJQUFJLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUMsQ0FBQztBQUNGLE1BQU0sS0FBSyxHQUFHLENBQUMsR0FBRyxPQUFPLEtBQUssT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxPQUFPLEtBQUs7QUFDbEUsSUFBSSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDaEMsUUFBUSxNQUFNLElBQUksU0FBUyxDQUFDLGlFQUFpRSxDQUFDLENBQUM7QUFDL0YsS0FBSztBQUNMLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEtBQUs7QUFDMUMsUUFBUSxJQUFJLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDckUsWUFBWSxPQUFPO0FBQ25CLFNBQVM7QUFDVCxRQUFRLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQ3ZFLFlBQVksTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVztBQUNuRCxrQkFBa0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0I7QUFDaEQsc0JBQXNCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNFLHNCQUFzQixDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZELGtCQUFrQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0IsU0FBUztBQUNULGFBQWEsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQ2xFLFlBQVksTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDM0QsU0FBUztBQUNULGFBQWE7QUFDYixZQUFZLE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDdkIsZ0JBQWdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxTQUFTO0FBQzFDLHNCQUFzQixLQUFLLENBQUMsT0FBTyxDQUFDLHVCQUF1QjtBQUMzRCwwQkFBMEIsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUN0QywwQkFBMEIsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUNyQyxzQkFBc0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLFNBQVM7QUFDVCxLQUFLLENBQUMsQ0FBQztBQUNQLElBQUksT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ1AsTUFBTSxjQUFjLEdBQUc7QUFDdkIsSUFBSSx1QkFBdUIsRUFBRSxJQUFJO0FBQ2pDLElBQUksV0FBVyxFQUFFLElBQUk7QUFDckIsSUFBSSxnQkFBZ0IsRUFBRSxJQUFJO0FBQzFCLENBQUMsQ0FBQztBQUNGLEtBQUssQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDO0FBQy9CLEtBQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxPQUFPLEtBQUs7QUFDN0MsSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDOUUsSUFBSSxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztBQUNyQyxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDO0FBQ25DLElBQUksT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQzs7TUNoQ1ksb0JBQW9CLENBQUE7QUFHL0IsSUFBQSxXQUFXLFFBQVEsR0FBQTtRQUNqQixNQUFNLGtCQUFrQixHQUFHLEVBQWlDLENBQUM7QUFDN0QsUUFBQSxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzNDLFFBQUEsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQztBQUM1QyxRQUFBLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDMUMsUUFBQSxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzlDLFFBQUEsa0JBQWtCLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQztRQUU5QyxPQUFPO0FBQ0wsWUFBQSxPQUFPLEVBQUUsT0FBTztBQUNoQixZQUFBLGtCQUFrQixFQUFFLElBQUk7QUFDeEIsWUFBQSxzQkFBc0IsRUFBRSxLQUFLO0FBQzdCLFlBQUEsOEJBQThCLEVBQUUsS0FBSztBQUNyQyxZQUFBLGtCQUFrQixFQUFFLElBQUk7QUFDeEIsWUFBQSxpQkFBaUIsRUFBRSxNQUFNO0FBQ3pCLFlBQUEsaUJBQWlCLEVBQUUsR0FBRztBQUN0QixZQUFBLDZCQUE2QixFQUFFLElBQUk7QUFDbkMsWUFBQSxvQkFBb0IsRUFBRSxHQUFHO0FBQ3pCLFlBQUEsbUJBQW1CLEVBQUUsR0FBRztBQUN4QixZQUFBLG9CQUFvQixFQUFFLEdBQUc7QUFDekIsWUFBQSxrQkFBa0IsRUFBRSxHQUFHO0FBQ3ZCLFlBQUEsZ0JBQWdCLEVBQUUsUUFBUTtBQUMxQixZQUFBLHVCQUF1QixFQUFFLEdBQUc7QUFDNUIsWUFBQSxtQ0FBbUMsRUFBRSxJQUFJO0FBQ3pDLFlBQUEsb0JBQW9CLEVBQUUsSUFBSTtBQUMxQixZQUFBLGtCQUFrQixFQUFFLEtBQUs7QUFDekIsWUFBQSxpQkFBaUIsRUFBRSxJQUFJO0FBQ3ZCLFlBQUEsMkJBQTJCLEVBQUUsR0FBRztZQUNoQyxnQkFBZ0IsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUMzQixjQUFjLEVBQUUsQ0FBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxTQUFTLENBQUM7QUFDdEUsWUFBQSxLQUFLLEVBQUUsRUFBRTtZQUNULHlCQUF5QixFQUFFLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDO1lBQ25FLGtCQUFrQjtBQUNsQixZQUFBLG9CQUFvQixFQUFFLElBQUk7QUFDMUIsWUFBQSxjQUFjLEVBQUUsRUFBRTtBQUNsQixZQUFBLG1CQUFtQixFQUFFLENBQUM7WUFDdEIscUJBQXFCLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDM0IsWUFBQSx1QkFBdUIsRUFBRSxLQUFLO0FBQzlCLFlBQUEsMkJBQTJCLEVBQUUsS0FBSztBQUNsQyxZQUFBLHFCQUFxQixFQUFFLEtBQUs7QUFDNUIsWUFBQSxxQkFBcUIsRUFBRSxLQUFLO0FBQzVCLFlBQUEsdUJBQXVCLEVBQUUsSUFBSTtZQUM3QixpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxrQkFBa0I7QUFDdkQsWUFBQSxjQUFjLEVBQUUsSUFBSTtBQUNwQixZQUFBLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ2hELFlBQUEsMEJBQTBCLEVBQUUsSUFBSTtBQUNoQyxZQUFBLDZCQUE2QixFQUFFLElBQUk7QUFDbkMsWUFBQSxxQkFBcUIsRUFBRTtBQUNyQixnQkFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBc0I7QUFDNUMsZ0JBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQXNCO0FBQzNDLGFBQUE7WUFDRCxnQkFBZ0IsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUM1QixZQUFBLHdCQUF3QixFQUFFO0FBQ3hCLGdCQUFBLFNBQVMsRUFBRSxLQUFLO0FBQ2hCLGdCQUFBLFdBQVcsRUFBRTtvQkFDWCxjQUFjLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUU7b0JBQ2pELFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFO29CQUNyRCxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUU7b0JBQzdDLFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixFQUFFO29CQUMxRCxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUU7b0JBQ3RDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtvQkFDckMsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUU7b0JBQ3ZELEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRTtBQUN2QyxpQkFBQTtBQUNELGdCQUFBLGtCQUFrQixFQUFFO29CQUNsQixNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUU7QUFDNUMsaUJBQUE7QUFDRixhQUFBO0FBQ0QsWUFBQSxZQUFZLEVBQUU7QUFDWixnQkFBQSxRQUFRLEVBQUUsR0FBRztBQUNiLGdCQUFBLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ3RELGdCQUFBLFNBQVMsRUFBRSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7Z0JBQzFCLFNBQVMsRUFBRSxXQUFXLEVBQUU7QUFDeEIsZ0JBQUEsdUJBQXVCLEVBQUUsS0FBSztBQUM5QixnQkFBQSwyQkFBMkIsRUFBRSxJQUFJO0FBQ2xDLGFBQUE7QUFDRCxZQUFBLCtCQUErQixFQUFFLEtBQUs7QUFDdEMsWUFBQSw4QkFBOEIsRUFBRSxLQUFLO0FBQ3JDLFlBQUEsMkJBQTJCLEVBQUUsS0FBSztBQUNsQyxZQUFBLDhCQUE4QixFQUFFLEVBQUU7QUFDbEMsWUFBQSwyQkFBMkIsRUFBRSxJQUFJO0FBQ2pDLFlBQUEsa0JBQWtCLEVBQUU7QUFDbEIsZ0JBQUEsU0FBUyxFQUFFLElBQUk7QUFDZixnQkFBQSxNQUFNLEVBQUU7b0JBQ04sU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQ2xCLG9CQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1Isb0JBQUEsT0FBTyxFQUFFLGtCQUFrQjtBQUM1QixpQkFBQTtnQkFDRCxxQkFBcUIsRUFBRSxDQUFDLFVBQVUsQ0FBQztBQUNuQyxnQkFBQSxrQkFBa0IsRUFBRSxJQUFJO0FBQ3hCLGdCQUFBLGlCQUFpQixFQUFFLElBQUk7QUFDeEIsYUFBQTtBQUNELFlBQUEsdUJBQXVCLEVBQUUsSUFBSTtBQUM3QixZQUFBLGNBQWMsRUFBRTtBQUNkLGdCQUFBLFFBQVEsRUFBRTtvQkFDUixFQUFFLFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7b0JBQ2pDLEVBQUUsU0FBUyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUNsQyxpQkFBQTtBQUNELGdCQUFBLFFBQVEsRUFBRTtvQkFDUixFQUFFLFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7b0JBQ2pDLEVBQUUsU0FBUyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUNsQyxpQkFBQTtBQUNGLGFBQUE7QUFDRCxZQUFBLHVCQUF1QixFQUFFLElBQUk7WUFDN0Isa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxDQUFDO0FBQzNELFlBQUEsYUFBYSxFQUFFLEdBQUc7QUFDbEIsWUFBQSxjQUFjLEVBQUU7QUFDZCxnQkFBQSxTQUFTLEVBQUUsS0FBSztBQUNoQixnQkFBQSxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDbkMsZ0JBQUEsUUFBUSxFQUFFLEVBQUU7QUFDWixnQkFBQSw4QkFBOEIsRUFBRSxxQkFBcUI7QUFDckQsZ0JBQUEsMEJBQTBCLEVBQ3hCLGdGQUFnRjtBQUNuRixhQUFBO0FBQ0QsWUFBQSw2QkFBNkIsRUFBRTtBQUM3QixnQkFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBc0I7QUFDeEMsZ0JBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQXNCO0FBQzdDLGFBQUE7U0FDRixDQUFDO0tBQ0g7QUFPRCxJQUFBLElBQUksT0FBTyxHQUFBO0FBQ1QsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0tBQzFCO0lBRUQsSUFBSSxPQUFPLENBQUMsS0FBYSxFQUFBO0FBQ3ZCLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0tBQzNCO0FBRUQsSUFBQSxJQUFJLG9CQUFvQixHQUFBO1FBQ3RCLE9BQU8seUJBQXlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUM7S0FDNUQ7QUFFRCxJQUFBLElBQUksZ0JBQWdCLEdBQUE7O0FBRWxCLFFBQUEsT0FBTyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsZ0JBQWdCLENBQUM7S0FDcEQ7QUFFRCxJQUFBLElBQUksZUFBZSxHQUFBOztBQUVqQixRQUFBLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixFQUFFLGVBQWUsQ0FBQztLQUNuRDtBQUVELElBQUEsSUFBSSxnQkFBZ0IsR0FBQTs7QUFFbEIsUUFBQSxPQUFPLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxnQkFBZ0IsQ0FBQztLQUNwRDtBQUVELElBQUEsSUFBSSxrQkFBa0IsR0FBQTtBQUNwQixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztLQUNyQztJQUVELElBQUksa0JBQWtCLENBQUMsS0FBYyxFQUFBO0FBQ25DLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7S0FDdEM7QUFFRCxJQUFBLElBQUksc0JBQXNCLEdBQUE7QUFDeEIsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUM7S0FDekM7SUFFRCxJQUFJLHNCQUFzQixDQUFDLEtBQWMsRUFBQTtBQUN2QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFDO0tBQzFDO0FBRUQsSUFBQSxJQUFJLDhCQUE4QixHQUFBO0FBQ2hDLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDO0tBQ2pEO0lBRUQsSUFBSSw4QkFBOEIsQ0FBQyxLQUFjLEVBQUE7QUFDL0MsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixHQUFHLEtBQUssQ0FBQztLQUNsRDtBQUVELElBQUEsSUFBSSxrQkFBa0IsR0FBQTtBQUNwQixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztLQUNyQztJQUVELElBQUksa0JBQWtCLENBQUMsS0FBYyxFQUFBO0FBQ25DLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7S0FDdEM7QUFFRCxJQUFBLElBQUkseUJBQXlCLEdBQUE7QUFDM0IsUUFBQSxPQUFPLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztLQUN4RDtBQUVELElBQUEsSUFBSSxpQkFBaUIsR0FBQTtBQUNuQixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztLQUNwQztJQUVELElBQUksaUJBQWlCLENBQUMsS0FBYSxFQUFBO0FBQ2pDLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7S0FDckM7QUFFRCxJQUFBLElBQUkseUJBQXlCLEdBQUE7QUFDM0IsUUFBQSxPQUFPLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztLQUN4RDtBQUVELElBQUEsSUFBSSxpQkFBaUIsR0FBQTtBQUNuQixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztLQUNwQztJQUVELElBQUksaUJBQWlCLENBQUMsS0FBYSxFQUFBO0FBQ2pDLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7S0FDckM7QUFFRCxJQUFBLElBQUksNkJBQTZCLEdBQUE7QUFDL0IsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUM7S0FDaEQ7SUFFRCxJQUFJLDZCQUE2QixDQUFDLEtBQWEsRUFBQTtBQUM3QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEdBQUcsS0FBSyxDQUFDO0tBQ2pEO0FBRUQsSUFBQSxJQUFJLG9CQUFvQixHQUFBO0FBQ3RCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDO0tBQ3ZDO0lBRUQsSUFBSSxvQkFBb0IsQ0FBQyxLQUFhLEVBQUE7QUFDcEMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztLQUN4QztBQUVELElBQUEsSUFBSSw0QkFBNEIsR0FBQTtBQUM5QixRQUFBLE9BQU8sb0JBQW9CLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDO0tBQzNEO0FBRUQsSUFBQSxJQUFJLG1CQUFtQixHQUFBO0FBQ3JCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO0tBQ3RDO0lBRUQsSUFBSSxtQkFBbUIsQ0FBQyxLQUFhLEVBQUE7QUFDbkMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztLQUN2QztBQUVELElBQUEsSUFBSSwyQkFBMkIsR0FBQTtBQUM3QixRQUFBLE9BQU8sb0JBQW9CLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDO0tBQzFEO0FBRUQsSUFBQSxJQUFJLG9CQUFvQixHQUFBO0FBQ3RCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDO0tBQ3ZDO0lBRUQsSUFBSSxvQkFBb0IsQ0FBQyxLQUFhLEVBQUE7QUFDcEMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztLQUN4QztBQUVELElBQUEsSUFBSSw0QkFBNEIsR0FBQTtBQUM5QixRQUFBLE9BQU8sb0JBQW9CLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDO0tBQzNEO0FBRUQsSUFBQSxJQUFJLGtCQUFrQixHQUFBO0FBQ3BCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO0tBQ3JDO0lBRUQsSUFBSSxrQkFBa0IsQ0FBQyxLQUFhLEVBQUE7QUFDbEMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztLQUN0QztBQUVELElBQUEsSUFBSSwwQkFBMEIsR0FBQTtBQUM1QixRQUFBLE9BQU8sb0JBQW9CLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDO0tBQ3pEO0FBRUQsSUFBQSxJQUFJLGdCQUFnQixHQUFBO0FBQ2xCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0tBQ25DO0lBRUQsSUFBSSxnQkFBZ0IsQ0FBQyxLQUFhLEVBQUE7QUFDaEMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztLQUNwQztBQUVELElBQUEsSUFBSSx3QkFBd0IsR0FBQTtBQUMxQixRQUFBLE9BQU8sb0JBQW9CLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDO0tBQ3ZEO0FBRUQsSUFBQSxJQUFJLHVCQUF1QixHQUFBO0FBQ3pCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDO0tBQzFDO0lBRUQsSUFBSSx1QkFBdUIsQ0FBQyxLQUFhLEVBQUE7QUFDdkMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztLQUMzQztBQUVELElBQUEsSUFBSSwrQkFBK0IsR0FBQTtBQUNqQyxRQUFBLE9BQU8sb0JBQW9CLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDO0tBQzlEO0FBRUQsSUFBQSxJQUFJLG1DQUFtQyxHQUFBO0FBQ3JDLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDO0tBQ3REO0lBRUQsSUFBSSxtQ0FBbUMsQ0FBQyxLQUFhLEVBQUE7QUFDbkQsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxHQUFHLEtBQUssQ0FBQztLQUN2RDtBQUVELElBQUEsSUFBSSxvQkFBb0IsR0FBQTtBQUN0QixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztLQUN2QztJQUVELElBQUksb0JBQW9CLENBQUMsS0FBYyxFQUFBO0FBQ3JDLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7S0FDeEM7QUFFRCxJQUFBLElBQUksa0JBQWtCLEdBQUE7QUFDcEIsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7S0FDckM7SUFFRCxJQUFJLGtCQUFrQixDQUFDLEtBQWMsRUFBQTtBQUNuQyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0tBQ3RDO0FBRUQsSUFBQSxJQUFJLGlCQUFpQixHQUFBO0FBQ25CLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO0tBQ3BDO0lBRUQsSUFBSSxpQkFBaUIsQ0FBQyxLQUFjLEVBQUE7QUFDbEMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztLQUNyQztBQUVELElBQUEsSUFBSSwyQkFBMkIsR0FBQTtBQUM3QixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQztLQUM5QztJQUVELElBQUksMkJBQTJCLENBQUMsS0FBYSxFQUFBO0FBQzNDLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsR0FBRyxLQUFLLENBQUM7S0FDL0M7QUFFRCxJQUFBLElBQUksZ0JBQWdCLEdBQUE7QUFDbEIsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7S0FDbkM7SUFFRCxJQUFJLGdCQUFnQixDQUFDLEtBQW9CLEVBQUE7QUFDdkMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztLQUNwQztBQUVELElBQUEsSUFBSSxjQUFjLEdBQUE7QUFDaEIsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO0tBQ2pDO0lBRUQsSUFBSSxjQUFjLENBQUMsS0FBb0IsRUFBQTtBQUNyQyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztLQUNsQztBQUVELElBQUEsSUFBSSxLQUFLLEdBQUE7QUFDUCxRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDeEI7SUFFRCxJQUFJLEtBQUssQ0FBQyxLQUFhLEVBQUE7QUFDckIsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7S0FDekI7QUFFRCxJQUFBLElBQUkseUJBQXlCLEdBQUE7QUFDM0IsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUM7S0FDNUM7SUFFRCxJQUFJLHlCQUF5QixDQUFDLEtBQW9CLEVBQUE7O0FBRWhELFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUMzRDtBQUVELElBQUEsSUFBSSxvQ0FBb0MsR0FBQTtRQUN0QyxPQUFPLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDM0U7QUFFRCxJQUFBLElBQUksb0JBQW9CLEdBQUE7QUFDdEIsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUM7S0FDdkM7SUFFRCxJQUFJLG9CQUFvQixDQUFDLEtBQWMsRUFBQTtBQUNyQyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO0tBQ3hDO0FBRUQsSUFBQSxJQUFJLGNBQWMsR0FBQTtBQUNoQixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7S0FDakM7SUFFRCxJQUFJLGNBQWMsQ0FBQyxLQUFvQixFQUFBOztBQUVyQyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ2hEO0FBRUQsSUFBQSxJQUFJLG1CQUFtQixHQUFBO0FBQ3JCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO0tBQ3RDO0lBRUQsSUFBSSxtQkFBbUIsQ0FBQyxLQUFhLEVBQUE7QUFDbkMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztLQUN2QztBQUVELElBQUEsSUFBSSxxQkFBcUIsR0FBQTtBQUN2QixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztLQUN4QztJQUVELElBQUkscUJBQXFCLENBQUMsS0FBb0IsRUFBQTtBQUM1QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDdkQ7QUFFRCxJQUFBLElBQUksdUJBQXVCLEdBQUE7QUFDekIsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUM7S0FDMUM7SUFFRCxJQUFJLHVCQUF1QixDQUFDLEtBQWMsRUFBQTtBQUN4QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxDQUFDO0tBQzNDO0FBRUQsSUFBQSxJQUFJLDJCQUEyQixHQUFBO0FBQzdCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDO0tBQzlDO0lBRUQsSUFBSSwyQkFBMkIsQ0FBQyxLQUFjLEVBQUE7QUFDNUMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUEyQixHQUFHLEtBQUssQ0FBQztLQUMvQztBQUVELElBQUEsSUFBSSxxQkFBcUIsR0FBQTtBQUN2QixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztLQUN4QztJQUVELElBQUkscUJBQXFCLENBQUMsS0FBYyxFQUFBO0FBQ3RDLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7S0FDekM7QUFFRCxJQUFBLElBQUkscUJBQXFCLEdBQUE7QUFDdkIsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7S0FDeEM7SUFFRCxJQUFJLHFCQUFxQixDQUFDLEtBQWMsRUFBQTtBQUN0QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDO0tBQ3pDO0FBRUQsSUFBQSxJQUFJLHVCQUF1QixHQUFBO0FBQ3pCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDO0tBQzFDO0lBRUQsSUFBSSx1QkFBdUIsQ0FBQyxLQUFjLEVBQUE7QUFDeEMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztLQUMzQztBQUVELElBQUEsSUFBSSxpQkFBaUIsR0FBQTtBQUNuQixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztLQUNwQztJQUVELElBQUksaUJBQWlCLENBQUMsS0FBd0IsRUFBQTtBQUM1QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO0tBQ3JDO0FBRUQsSUFBQSxJQUFJLGNBQWMsR0FBQTtBQUNoQixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7S0FDakM7SUFFRCxJQUFJLGNBQWMsQ0FBQyxLQUFjLEVBQUE7QUFDL0IsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7S0FDbEM7QUFFRCxJQUFBLElBQUksbUJBQW1CLEdBQUE7QUFDckIsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUM7S0FDdEM7SUFFRCxJQUFJLG1CQUFtQixDQUFDLEtBQXFCLEVBQUE7QUFDM0MsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztLQUN2QztBQUVELElBQUEsSUFBSSwwQkFBMEIsR0FBQTtBQUM1QixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQztLQUM3QztJQUVELElBQUksMEJBQTBCLENBQUMsS0FBYyxFQUFBO0FBQzNDLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsR0FBRyxLQUFLLENBQUM7S0FDOUM7QUFFRCxJQUFBLElBQUksNkJBQTZCLEdBQUE7QUFDL0IsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUM7S0FDaEQ7SUFFRCxJQUFJLDZCQUE2QixDQUFDLEtBQWMsRUFBQTtBQUM5QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEdBQUcsS0FBSyxDQUFDO0tBQ2pEO0FBRUQsSUFBQSxJQUFJLHFCQUFxQixHQUFBO0FBQ3ZCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO0tBQ3hDO0lBRUQsSUFBSSxxQkFBcUIsQ0FBQyxLQUErQixFQUFBOztBQUV2RCxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDdkQ7QUFFRCxJQUFBLElBQUksZ0JBQWdCLEdBQUE7QUFDbEIsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7S0FDbkM7SUFFRCxJQUFJLGdCQUFnQixDQUFDLEtBQW9CLEVBQUE7QUFDdkMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztLQUNwQztBQUVELElBQUEsSUFBSSx3QkFBd0IsR0FBQTtBQUMxQixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztLQUMzQztJQUVELElBQUksd0JBQXdCLENBQUMsS0FBK0MsRUFBQTtBQUMxRSxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsS0FBSyxDQUFDO0tBQzVDO0FBRUQsSUFBQSxJQUFJLFlBQVksR0FBQTtBQUNkLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztLQUMvQjtJQUVELElBQUksWUFBWSxDQUFDLEtBQXdCLEVBQUE7QUFDdkMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7S0FDaEM7QUFFRCxJQUFBLElBQUksK0JBQStCLEdBQUE7QUFDakMsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUM7S0FDbEQ7SUFFRCxJQUFJLCtCQUErQixDQUFDLEtBQWMsRUFBQTtBQUNoRCxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQStCLEdBQUcsS0FBSyxDQUFDO0tBQ25EO0FBRUQsSUFBQSxJQUFJLDhCQUE4QixHQUFBO0FBQ2hDLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDO0tBQ2pEO0lBRUQsSUFBSSw4QkFBOEIsQ0FBQyxLQUFjLEVBQUE7QUFDL0MsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixHQUFHLEtBQUssQ0FBQztLQUNsRDtBQUVELElBQUEsSUFBSSwyQkFBMkIsR0FBQTtBQUM3QixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQztLQUM5QztJQUVELElBQUksMkJBQTJCLENBQUMsS0FBYyxFQUFBO0FBQzVDLFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsR0FBRyxLQUFLLENBQUM7S0FDL0M7QUFFRCxJQUFBLElBQUksOEJBQThCLEdBQUE7QUFDaEMsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUM7S0FDakQ7SUFFRCxJQUFJLDhCQUE4QixDQUFDLEtBQWEsRUFBQTtBQUM5QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLEdBQUcsS0FBSyxDQUFDO0tBQ2xEO0FBRUQsSUFBQSxJQUFJLDJCQUEyQixHQUFBO0FBQzdCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDO0tBQzlDO0lBRUQsSUFBSSwyQkFBMkIsQ0FBQyxLQUFjLEVBQUE7QUFDNUMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUEyQixHQUFHLEtBQUssQ0FBQztLQUMvQztBQUVELElBQUEsSUFBSSxrQkFBa0IsR0FBQTtBQUNwQixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztLQUNyQztJQUVELElBQUksa0JBQWtCLENBQUMsS0FBdUIsRUFBQTtBQUM1QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0tBQ3RDO0FBRUQsSUFBQSxJQUFJLHVCQUF1QixHQUFBO0FBQ3pCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDO0tBQzFDO0lBRUQsSUFBSSx1QkFBdUIsQ0FBQyxLQUFjLEVBQUE7QUFDeEMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztLQUMzQztBQUVELElBQUEsSUFBSSxjQUFjLEdBQUE7QUFDaEIsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO0tBQ2pDO0lBRUQsSUFBSSxjQUFjLENBQUMsS0FBMkIsRUFBQTtBQUM1QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztLQUNsQztBQUVELElBQUEsSUFBSSx1QkFBdUIsR0FBQTtBQUN6QixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztLQUMxQztJQUVELElBQUksdUJBQXVCLENBQUMsS0FBa0IsRUFBQTtBQUM1QyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxDQUFDO0tBQzNDO0FBRUQsSUFBQSxJQUFJLGtCQUFrQixHQUFBO0FBQ3BCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO0tBQ3JDO0lBRUQsSUFBSSxrQkFBa0IsQ0FBQyxLQUFlLEVBQUE7QUFDcEMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztLQUN0QztBQUVELElBQUEsSUFBSSxhQUFhLEdBQUE7QUFDZixRQUFBLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7S0FDaEM7SUFFRCxJQUFJLGFBQWEsQ0FBQyxLQUFhLEVBQUE7QUFDN0IsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7S0FDakM7QUFFRCxJQUFBLElBQUksY0FBYyxHQUFBO0FBQ2hCLFFBQUEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztLQUNqQztJQUVELElBQUksY0FBYyxDQUFDLEtBQTJCLEVBQUE7QUFDNUMsUUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7S0FDbEM7QUFFRCxJQUFBLElBQUksNkJBQTZCLEdBQUE7QUFDL0IsUUFBQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUM7S0FDaEQ7SUFFRCxJQUFJLDZCQUE2QixDQUFDLEtBQStCLEVBQUE7O0FBRS9ELFFBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUMvRDtBQUVELElBQUEsV0FBQSxDQUFvQixNQUEwQixFQUFBO1FBQTFCLElBQU0sQ0FBQSxNQUFBLEdBQU4sTUFBTSxDQUFvQjtBQUM1QyxRQUFBLElBQUksQ0FBQyxJQUFJLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUFDO0tBQzNDO0FBRUQsSUFBQSxNQUFNLHlCQUF5QixHQUFBO0FBQzdCLFFBQUEsTUFBTSxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FDMUMsSUFBSSxDQUFDLE1BQU0sRUFDWCxvQkFBb0IsQ0FBQyxRQUFRLENBQzlCLENBQUM7QUFDRixRQUFBLE9BQU8sTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDbEM7QUFFRCxJQUFBLE1BQU0sWUFBWSxHQUFBO1FBQ2hCLE1BQU0sSUFBSSxHQUFHLENBQ1gsU0FBWSxFQUNaLFdBQWMsRUFDZCxJQUFvQixLQUNaO0FBQ1IsWUFBQSxNQUFNLFdBQVcsR0FBRyxDQUFDLDBCQUEwQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBRWpFLFlBQUEsTUFBTSxTQUFTLEdBQUcsQ0FBQyxHQUFZLEtBQUk7Z0JBQ2pDLE9BQU8sS0FBSyxDQUFDLFdBQVcsQ0FDdEIsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLEVBQ3RCLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFDaEIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUNELENBQUM7QUFDbEIsYUFBQyxDQUFDO0FBRUYsWUFBQSxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtBQUN0QixnQkFBQSxJQUFJLEdBQUcsSUFBSSxTQUFTLEVBQUU7b0JBQ3BCLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQWEsQ0FBQztBQUNwRCwwQkFBRSxTQUFTLENBQUMsR0FBRyxDQUFDO0FBQ2hCLDBCQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDcEI7YUFDRjtBQUNILFNBQUMsQ0FBQztBQUVGLFFBQUEsSUFBSTtZQUNGLE1BQU0sU0FBUyxJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBaUIsQ0FBQztZQUNsRSxJQUFJLFNBQVMsRUFBRTtnQkFDYixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FFckQsQ0FBQztnQkFDRixJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDbEM7U0FDRjtRQUFDLE9BQU8sR0FBRyxFQUFFO0FBQ1osWUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLHNEQUFzRCxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzFFO0tBQ0Y7QUFFRCxJQUFBLE1BQU0sWUFBWSxHQUFBO0FBQ2hCLFFBQUEsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDOUIsUUFBQSxNQUFNLE1BQU0sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDOUI7SUFFRCxJQUFJLEdBQUE7UUFDRixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFJO0FBQzlCLFlBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4Q0FBOEMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqRSxTQUFDLENBQUMsQ0FBQztLQUNKO0FBRUQsSUFBQSxtQkFBbUIsQ0FBQyxNQUFrQixFQUFBO0FBQ3BDLFFBQUEsTUFBTSxFQUFFLGtCQUFrQixFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN6QyxJQUFJLEtBQUssR0FBRyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFckUsUUFBQSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsRUFBRTtBQUNwRSxZQUFBLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNwQztBQUVELFFBQUEsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELG9CQUFvQixDQUFDLE1BQWtCLEVBQUUsU0FBa0IsRUFBQTtRQUN6RCxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQztLQUNsRDtBQUVELElBQUEsYUFBYSxpQkFBaUIsQ0FDNUIsTUFBMEIsRUFDMUIsUUFBc0IsRUFBQTtRQUV0QixNQUFNLG9CQUFvQixDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNuRSxNQUFNLG9CQUFvQixDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztLQUNwRTtBQUVELElBQUEsYUFBYSxxQkFBcUIsQ0FDaEMsTUFBMEIsRUFDMUIsUUFBc0IsRUFBQTtRQUV0QixJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7QUFFMUIsUUFBQSxJQUFJO1lBQ0YsTUFBTSxJQUFJLElBQUksTUFBTSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQTRCLENBQUM7QUFDbkUsWUFBQSxJQUFJLElBQUksSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQ3BDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUU3QixnQkFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsRUFBRTs7b0JBRTNELE1BQU0saUJBQWlCLEdBQUcsb0JBQW9CLENBQUM7QUFDL0Msb0JBQUEsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLEVBQUU7d0JBQ2pFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztBQUMxQiw0QkFBQSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxRQUFRLENBQUMsb0JBQW9CLENBQUM7QUFDM0Qsd0JBQUEsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztxQkFDaEM7O29CQUdELE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQztBQUNqQyxvQkFBQSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQTJCLENBQUM7QUFDL0Usb0JBQUEsSUFDRSxXQUFXO0FBQ1gsd0JBQUEsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsRUFDL0Q7d0JBQ0EsV0FBVyxDQUFDLGNBQWMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN4RCx3QkFBQSxPQUFPLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztxQkFDbEM7QUFFRCxvQkFBQSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQzNCLG9CQUFBLE1BQU0sTUFBTSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDN0IsYUFBYSxHQUFHLElBQUksQ0FBQztpQkFDdEI7YUFDRjtTQUNGO1FBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZCxZQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0RBQW9ELEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDMUU7QUFFRCxRQUFBLE9BQU8sYUFBYSxDQUFDO0tBQ3RCO0FBRUQsSUFBQSxhQUFhLHFCQUFxQixDQUNoQyxNQUEwQixFQUMxQixRQUFzQixFQUFBO1FBRXRCLElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQztBQUUxQixRQUFBLElBQUk7WUFDRixNQUFNLElBQUksSUFBSSxNQUFNLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBNEIsQ0FBQztBQUNuRSxZQUFBLElBQUksSUFBSSxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtnQkFDcEMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBRTdCLGdCQUFBLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLE9BQU8sRUFBRTtvQkFDaEMsTUFBTSwyQkFBMkIsR0FBRywwQkFBMEIsQ0FBQztBQUMvRCxvQkFBQSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsMkJBQTJCLENBQUMsRUFBRTs7O0FBRzNFLHdCQUFBLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FHdEQsQ0FBQzt3QkFFRixNQUFNLFdBQVcsR0FBc0MsRUFBRSxDQUFDO3dCQUMxRCxJQUFJLENBQUMsMkJBQTJCLENBQUMsR0FBRztBQUNsQyw0QkFBQSxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQzs0QkFDbkQsV0FBVzt5QkFDWixDQUFDO0FBRUYsd0JBQUEsT0FBTyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUU5Qyx3QkFBQSxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxLQUFJO0FBQ3RELDRCQUFBLE1BQU0sS0FBSyxHQUNULFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQzs0QkFDbEUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3RDLHlCQUFDLENBQUMsQ0FBQztxQkFDSjtvQkFFRCxNQUFNLGVBQWUsR0FBRyxjQUFjLENBQUM7QUFDdkMsb0JBQUEsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxFQUFFOzt3QkFFL0QsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDO0FBRWpDLHdCQUFBLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBa0IsQ0FBQztBQUNoRSx3QkFBQSxNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLENBQW9CLENBQUM7d0JBRXZFLE1BQU0sU0FBUyxHQUFHLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxLQUFJO0FBQzVELDRCQUFBLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQVcsQ0FBQztBQUN6Qyw0QkFBQSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsUUFBUSxDQUFDO0FBQzdCLDRCQUFBLE9BQU8sUUFBUSxDQUFDO3lCQUNqQixFQUFFLEVBQW1CLENBQUMsQ0FBQztBQUV4Qix3QkFBQSxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsR0FBRyxTQUFTLENBQUM7cUJBQzVDO0FBRUQsb0JBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLE9BQU8sQ0FBQztBQUMzQixvQkFBQSxNQUFNLE1BQU0sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzdCLGFBQWEsR0FBRyxJQUFJLENBQUM7aUJBQ3RCO2FBQ0Y7U0FDRjtRQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsWUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLG9EQUFvRCxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzFFO0FBRUQsUUFBQSxPQUFPLGFBQWEsQ0FBQztLQUN0QjtBQUNGOztNQ2h6QnFCLGtCQUFrQixDQUFBO0FBQ3RDLElBQUEsV0FBQSxDQUNZLEdBQVEsRUFDUixlQUF1QyxFQUN2QyxNQUE0QixFQUFBO1FBRjVCLElBQUcsQ0FBQSxHQUFBLEdBQUgsR0FBRyxDQUFLO1FBQ1IsSUFBZSxDQUFBLGVBQUEsR0FBZixlQUFlLENBQXdCO1FBQ3ZDLElBQU0sQ0FBQSxNQUFBLEdBQU4sTUFBTSxDQUFzQjtLQUNwQztBQUlKOzs7Ozs7QUFNRztBQUNILElBQUEsYUFBYSxDQUFDLFdBQXdCLEVBQUUsSUFBYSxFQUFFLElBQWEsRUFBQTtBQUNsRSxRQUFBLE1BQU0sT0FBTyxHQUFHLElBQUlDLGdCQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDekMsUUFBQSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RCLFFBQUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUV0QixRQUFBLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0FBQ0Q7Ozs7OztBQU1HO0FBQ0gsSUFBQSxlQUFlLENBQUMsV0FBd0IsRUFBRSxLQUFhLEVBQUUsSUFBSSxHQUFHLEVBQUUsRUFBQTtBQUNoRSxRQUFBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RCxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7QUFFckIsUUFBQSxPQUFPLE9BQU8sQ0FBQztLQUNoQjtBQUVEOzs7Ozs7Ozs7QUFTRztJQUNILGNBQWMsQ0FDWixXQUF3QixFQUN4QixJQUFZLEVBQ1osSUFBWSxFQUNaLFlBQW9CLEVBQ3BCLGdCQUFzQyxFQUN0QyxlQUF3QixFQUFBO0FBRXhCLFFBQUEsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBRTVELFFBQUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksS0FBSTtBQUN2QixZQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDckMsWUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRTVCLFlBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsS0FBSTtBQUN6QixnQkFBQSxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLFFBQVEsR0FBRyxZQUFZLENBQUM7QUFDeEQsZ0JBQUEsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3BELGFBQUMsQ0FBQyxDQUFDO0FBQ0wsU0FBQyxDQUFDLENBQUM7QUFFSCxRQUFBLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0FBRUQ7Ozs7Ozs7OztBQVNHO0lBQ0gsZ0JBQWdCLENBQ2QsV0FBd0IsRUFDeEIsSUFBWSxFQUNaLElBQVksRUFDWixZQUFxQixFQUNyQixnQkFBdUMsRUFDdkMsUUFBaUUsRUFBQTtBQUVqRSxRQUFBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUU1RCxRQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEtBQUk7QUFDekIsWUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzVCLFlBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssS0FBSTtnQkFDdEIsSUFBSSxRQUFRLEVBQUU7QUFDWixvQkFBQSxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDOUI7cUJBQU07QUFDTCxvQkFBQSxJQUFJLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ25EO0FBQ0gsYUFBQyxDQUFDLENBQUM7QUFDTCxTQUFDLENBQUMsQ0FBQztBQUVILFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7QUFFRDs7Ozs7Ozs7O0FBU0c7SUFDSCxrQkFBa0IsQ0FDaEIsV0FBd0IsRUFDeEIsSUFBWSxFQUNaLElBQVksRUFDWixZQUFvQixFQUNwQixnQkFBMkQsRUFDM0QsZUFBd0IsRUFBQTtBQUV4QixRQUFBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUU1RCxRQUFBLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLEtBQUk7QUFDM0IsWUFBQSxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3JDLFlBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUU1QixZQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLEtBQUk7QUFDekIsZ0JBQUEsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxRQUFRLEdBQUcsWUFBWSxDQUFDO0FBQ3hELGdCQUFBLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7Z0JBQzdELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNsRixhQUFDLENBQUMsQ0FBQztBQUNMLFNBQUMsQ0FBQyxDQUFDO0FBRUgsUUFBQSxPQUFPLE9BQU8sQ0FBQztLQUNoQjtBQUVEOzs7Ozs7Ozs7O0FBVUc7QUFDSCxJQUFBLGtCQUFrQixDQUNoQixXQUF3QixFQUN4QixJQUFZLEVBQ1osSUFBWSxFQUNaLFlBQW9CLEVBQ3BCLE9BQStCLEVBQy9CLGdCQUFzQyxFQUN0QyxRQUFtRSxFQUFBO0FBRW5FLFFBQUEsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBRTVELFFBQUEsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksS0FBSTtBQUMzQixZQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekIsWUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRTVCLFlBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsS0FBSTtnQkFDekIsSUFBSSxRQUFRLEVBQUU7QUFDWixvQkFBQSxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDakM7cUJBQU07QUFDTCxvQkFBQSxJQUFJLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBQ3REO0FBQ0gsYUFBQyxDQUFDLENBQUM7QUFDTCxTQUFDLENBQUMsQ0FBQztBQUVILFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7QUFFRCxJQUFBLGdCQUFnQixDQUNkLFdBQXdCLEVBQ3hCLElBQVksRUFDWixJQUFZLEVBQ1osWUFBb0IsRUFDcEIsTUFBZ0QsRUFDaEQsZ0JBQXNDLEVBQ3RDLFFBQWdFLEVBQUE7QUFFaEUsUUFBQSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRzVELFFBQUEsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksS0FBSTtBQUM5QixZQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNsQyxZQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNuQyxZQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzRSxZQUFBLE9BQU8sSUFBSSxDQUFDO0FBQ2QsU0FBQyxDQUFDLENBQUM7QUFFSCxRQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEtBQUk7QUFDekIsWUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEQsWUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBRXpCLFlBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssS0FBSTtnQkFDdEIsSUFBSSxRQUFRLEVBQUU7QUFDWixvQkFBQSxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDOUI7cUJBQU07QUFDTCxvQkFBQSxJQUFJLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ25EO0FBQ0gsYUFBQyxDQUFDLENBQUM7QUFDTCxTQUFDLENBQUMsQ0FBQztBQUVILFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7QUFFRDs7Ozs7QUFLRztJQUNILG1CQUFtQixDQUNqQixnQkFBbUIsRUFDbkIsS0FBOEIsRUFBQTtRQUU5QixJQUFJLGdCQUFnQixFQUFFO0FBQ3BCLFlBQUEsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztBQUN4QixZQUFBLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNqQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDZjtLQUNGO0FBQ0Y7O0FDaFBLLE1BQU8sMkJBQTRCLFNBQVEsa0JBQWtCLENBQUE7QUFDakUsSUFBQSxPQUFPLENBQUMsV0FBd0IsRUFBQTtBQUM5QixRQUFBLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFFeEIsUUFBQSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO0FBRWxFLFFBQUEsSUFBSSxDQUFDLGNBQWMsQ0FDakIsV0FBVyxFQUNYLDZCQUE2QixFQUM3QixpRUFBaUUsRUFDakUsTUFBTSxDQUFDLG9CQUFvQixFQUMzQixzQkFBc0IsRUFDdEIsTUFBTSxDQUFDLDRCQUE0QixDQUNwQyxDQUFDO0tBQ0g7QUFDRjs7QUNmSyxNQUFPLDZCQUE4QixTQUFRLGtCQUFrQixDQUFBO0FBQ25FLElBQUEsT0FBTyxDQUFDLFdBQXdCLEVBQUE7QUFDOUIsUUFBQSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBRXhCLFFBQUEsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztBQUVoRSxRQUFBLElBQUksQ0FBQyxjQUFjLENBQ2pCLFdBQVcsRUFDWCwyQkFBMkIsRUFDM0IsK0RBQStELEVBQy9ELE1BQU0sQ0FBQyxrQkFBa0IsRUFDekIsb0JBQW9CLEVBQ3BCLE1BQU0sQ0FBQywwQkFBMEIsQ0FDbEMsQ0FBQztLQUNIO0FBQ0Y7O0FDWkssTUFBTyw4QkFBK0IsU0FBUSxrQkFBa0IsQ0FBQTtBQUNwRSxJQUFBLE9BQU8sQ0FBQyxXQUF3QixFQUFBO0FBQzlCLFFBQUEsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztBQUV4QixRQUFBLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLGtDQUFrQyxDQUFDLENBQUM7QUFFdEUsUUFBQSxJQUFJLENBQUMsY0FBYyxDQUNqQixXQUFXLEVBQ1gsaUNBQWlDLEVBQ2pDLDRRQUE0USxFQUM1USxNQUFNLENBQUMsdUJBQXVCLEVBQzlCLHlCQUF5QixFQUN6QixNQUFNLENBQUMsK0JBQStCLENBQ3ZDLENBQUM7QUFFRixRQUFBLElBQUksQ0FBQyxjQUFjLENBQ2pCLFdBQVcsRUFDWCxzREFBc0QsRUFDdEQsa0pBQWtKLEVBQ2xKLE1BQU0sQ0FBQyxtQ0FBbUMsRUFDMUMscUNBQXFDLEVBQ3JDLE1BQU0sQ0FBQyxtQ0FBbUMsQ0FDM0MsQ0FBQztBQUVGLFFBQUEsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUVsRCxRQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsV0FBVyxFQUNYLG9CQUFvQixFQUNwQiw0SUFBNEksRUFDNUksTUFBTSxDQUFDLHVCQUF1QixFQUM5Qix5QkFBeUIsQ0FDMUIsQ0FBQztLQUNIO0lBRUQsdUJBQXVCLENBQUMsV0FBd0IsRUFBRSxNQUE0QixFQUFBO1FBQzVFLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxFQUFjLENBQUM7UUFDckUsTUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xELFFBQUEsTUFBTSxJQUFJLEdBQUcsQ0FBMkYsd0ZBQUEsRUFBQSxnQkFBZ0IsRUFBRSxDQUFDO0FBRTNILFFBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUseUJBQXlCLEVBQUUsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUMxRSxDQUFDLFFBQVEsS0FBSTtBQUNYLFlBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFekQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsTUFBSztnQkFDakQsTUFBTSxNQUFNLEdBQUcsUUFBUTtBQUNwQixxQkFBQSxRQUFRLEVBQUU7cUJBQ1YsS0FBSyxDQUFDLElBQUksQ0FBQztxQkFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3BCLHFCQUFBLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUUvQixNQUFNLGFBQWEsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQy9DLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FDbEMsQ0FBQztBQUVGLGdCQUFBLElBQUksYUFBYSxFQUFFLE1BQU0sRUFBRTtBQUN6QixvQkFBQSxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztpQkFDcEU7cUJBQU07QUFDTCxvQkFBQSxNQUFNLENBQUMsbUJBQW1CLEdBQUcsTUFBd0IsQ0FBQztvQkFDdEQsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUNmO0FBQ0gsYUFBQyxDQUFDLENBQUM7QUFDTCxTQUFDLENBQ0YsQ0FBQztLQUNIO0lBRUQsY0FBYyxDQUFDLFlBQW9CLEVBQUUsYUFBcUIsRUFBQTtRQUN4RCxNQUFNLEtBQUssR0FBRyxJQUFJQyxjQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRWxDLFFBQUEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUNuRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxvREFBb0QsYUFBYSxDQUFBLDRDQUFBLEVBQStDLFlBQVksQ0FBQSxDQUFFLENBQUM7UUFDM0osS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2Q7QUFDRjs7QUN4RUssTUFBTyx5QkFBMEIsU0FBUSxrQkFBa0IsQ0FBQTtBQUMvRCxJQUFBLE9BQU8sQ0FBQyxXQUF3QixFQUFBO0FBQzlCLFFBQUEsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztBQUV4QixRQUFBLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDdEQsUUFBQSxJQUFJLENBQUMseUJBQXlCLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3BELFFBQUEsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNyRCxRQUFBLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFdEQsUUFBQSxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsV0FBVyxFQUNYLDBCQUEwQixFQUMxQixtRkFBbUYsRUFDbkYsTUFBTSxDQUFDLGNBQWMsRUFDckIsZ0JBQWdCLENBQ2pCLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFFdEMsUUFBQSxJQUFJLENBQUMsY0FBYyxDQUNqQixXQUFXLEVBQ1gsK0JBQStCLEVBQy9CLDhGQUE4RixFQUM5RixNQUFNLENBQUMsYUFBYSxFQUNwQixlQUFlLENBQ2hCLENBQUM7QUFFRixRQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsV0FBVyxFQUNYLDRCQUE0QixFQUM1QixnT0FBZ08sRUFDaE8sTUFBTSxDQUFDLGtCQUFrQixFQUN6QixvQkFBb0IsQ0FDckIsQ0FBQztBQUVGLFFBQUEsSUFBSSxDQUFDLGdCQUFnQixDQUNuQixXQUFXLEVBQ1gsaUNBQWlDLEVBQ2pDLHFJQUFxSSxFQUNySSxNQUFNLENBQUMsNkJBQTZCLEVBQ3BDLCtCQUErQixDQUNoQyxDQUFDO0FBRUYsUUFBQSxJQUFJLENBQUMsZ0JBQWdCLENBQ25CLFdBQVcsRUFDWCxzQkFBc0IsRUFDdEIscUVBQXFFLEVBQ3JFLE1BQU0sQ0FBQywwQkFBMEIsRUFDakMsNEJBQTRCLENBQzdCLENBQUM7QUFFRixRQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsV0FBVyxFQUNYLDJDQUEyQyxFQUMzQyxpRkFBaUYsRUFDakYsTUFBTSxDQUFDLDJCQUEyQixFQUNsQyw2QkFBNkIsQ0FDOUIsQ0FBQztBQUVGLFFBQUEsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN2RCxRQUFBLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFakQsUUFBQSxJQUFJLENBQUMsZ0JBQWdCLENBQ25CLFdBQVcsRUFDWCx3Q0FBd0MsRUFDeEMscUdBQXFHLEVBQ3JHLE1BQU0sQ0FBQywrQkFBK0IsRUFDdEMsaUNBQWlDLENBQ2xDLENBQUM7QUFDRixRQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsV0FBVyxFQUNYLHdCQUF3QixFQUN4QixxRkFBcUYsRUFDckYsTUFBTSxDQUFDLDhCQUE4QixFQUNyQyxnQ0FBZ0MsQ0FDakMsQ0FBQztBQUVGLFFBQUEsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNyRDtJQUVELDJCQUEyQixDQUN6QixXQUF3QixFQUN4QixNQUE0QixFQUFBO0FBRTVCLFFBQUEsTUFBTSxPQUFPLEdBQWdDO0FBQzNDLFlBQUEsRUFBRSxFQUFFLGtCQUFrQjtBQUN0QixZQUFBLE9BQU8sRUFBRSxTQUFTO1NBQ25CLENBQUM7QUFFRixRQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FDckIsV0FBVyxFQUNYLG1DQUFtQyxFQUNuQyxpSEFBaUgsRUFDakgsTUFBTSxDQUFDLHVCQUF1QixFQUM5QixPQUFPLEVBQ1AseUJBQXlCLENBQzFCLENBQUM7S0FDSDtJQUVELHFCQUFxQixDQUFDLFdBQXdCLEVBQUUsTUFBNEIsRUFBQTtRQUMxRSxNQUFNLE9BQU8sR0FBMkIsRUFBRSxDQUFDO1FBQzNDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUM7UUFDekQsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUN6RCxPQUFPLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsb0JBQW9CLENBQUM7UUFDeEUsT0FBTyxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsMEJBQTBCLENBQUM7QUFDdEYsUUFBQSxPQUFPLENBQUMsaUJBQWlCLENBQUMsMEJBQTBCLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDOUQsWUFBQSx3Q0FBd0MsQ0FBQztRQUUzQyxJQUFJLENBQUMsa0JBQWtCLENBQ3JCLFdBQVcsRUFDWCxvQ0FBb0MsRUFDcEMsd0RBQXdELEVBQ3hELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsRUFDbkMsT0FBTyxFQUNQLElBQUksRUFDSixDQUFDLFFBQVEsRUFBRSxNQUFNLEtBQUk7QUFDbkIsWUFBQSxNQUFNLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNoQixTQUFDLENBQ0YsQ0FBQztLQUNIO0lBRUQseUJBQXlCLENBQ3ZCLFdBQXdCLEVBQ3hCLE1BQTRCLEVBQUE7QUFFNUIsUUFBQSxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNsQyxhQUFBLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsYUFBQSxJQUFJLEVBQUUsQ0FBQztRQUNWLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekMsUUFBQSxNQUFNLElBQUksR0FBRyxDQUF3RyxxR0FBQSxFQUFBLFlBQVksRUFBRSxDQUFDO0FBRXBJLFFBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxLQUFJO0FBQ2xGLFlBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFM0QsUUFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsTUFBSztnQkFDakQsTUFBTSxNQUFNLEdBQUcsUUFBUTtBQUNwQixxQkFBQSxRQUFRLEVBQUU7cUJBQ1YsS0FBSyxDQUFDLElBQUksQ0FBQztxQkFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3BCLHFCQUFBLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRS9CLGdCQUFBLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQ3RELENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FDOUIsQ0FBQztBQUVGLGdCQUFBLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRTtBQUN4QixvQkFBQSxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7aUJBQ2hFO3FCQUFNO0FBQ0wsb0JBQUEsTUFBTSxDQUFDLHFCQUFxQixHQUFHLE1BQWtDLENBQUM7b0JBQ2xFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7O0FBSWQsb0JBQUEsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztpQkFDMUQ7QUFDSCxhQUFDLENBQUMsQ0FBQztBQUNMLFNBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxjQUFjLENBQUMsYUFBcUIsRUFBRSxVQUFrQixFQUFBO1FBQ3RELE1BQU0sS0FBSyxHQUFHLElBQUlBLGNBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFbEMsUUFBQSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0QyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRywyQ0FBMkMsVUFBVSxDQUFBLHNDQUFBLEVBQXlDLGFBQWEsQ0FBQSxDQUFFLENBQUM7UUFDMUksS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2Q7SUFFRCwwQkFBMEIsQ0FDeEIsV0FBd0IsRUFDeEIsTUFBNEIsRUFBQTtBQUU1QixRQUFBLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDbEMsTUFBTSxJQUFJLEdBQ1IsK05BQStOLENBQUM7QUFFbE8sUUFBQSxNQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztRQUNwQyxNQUFNLE9BQU8sR0FBMkIsRUFBRSxDQUFDLGdCQUFnQixHQUFHLGlCQUFpQixFQUFFLENBQUM7O0FBR2xGLFFBQUEsTUFBTSxTQUFTLEdBQUcsWUFBWSxFQUFFLENBQUM7QUFDakMsUUFBQSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFJO0FBQ3pCLFlBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztBQUN2QixTQUFDLENBQUMsQ0FBQztRQUVILElBQUksWUFBWSxHQUFHLGdCQUFnQixDQUFDO1FBQ3BDLElBQ0UsY0FBYyxDQUFDLFNBQVM7WUFDeEIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsVUFBK0IsQ0FBQyxFQUNsRTtBQUNBLFlBQUEsWUFBWSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUM7U0FDMUM7UUFFRCxJQUFJLENBQUMsa0JBQWtCLENBQ3JCLFdBQVcsRUFDWCw4RUFBOEUsRUFDOUUsSUFBSSxFQUNKLFlBQVksRUFDWixPQUFPLEVBQ1AsSUFBSSxFQUNKLENBQUMsUUFBUSxFQUFFLE1BQU0sS0FBSTtBQUNuQixZQUFBLE1BQU0sU0FBUyxHQUFHLFFBQVEsS0FBSyxnQkFBZ0IsQ0FBQztBQUVoRCxZQUFBLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUM1QyxJQUFJLFNBQVMsRUFBRTtBQUNiLGdCQUFBLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQzthQUM3QztZQUVELE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGtDQUFrQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzVFLFNBQUMsQ0FDRixDQUFDO0tBQ0g7SUFFRCw0QkFBNEIsQ0FDMUIsV0FBd0IsRUFDeEIsTUFBNEIsRUFBQTtBQUU1QixRQUFBLE1BQU0sRUFDSix3QkFBd0IsRUFBRSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsa0JBQWtCLEVBQUUsR0FDekUsR0FBRyxNQUFNLENBQUM7QUFFWCxRQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsV0FBVyxFQUNYLDZCQUE2QixFQUM3QixzS0FBc0ssRUFDdEssU0FBUyxFQUNULElBQUksRUFDSixDQUFDLFNBQVMsRUFBRSxNQUFNLEtBQUk7QUFDcEIsWUFBQSxNQUFNLENBQUMsd0JBQXdCLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQzs7O0FBSXRELFlBQUEsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksQ0FDeEIsTUFBSzs7O0FBR0gsZ0JBQUEsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNqQyxhQUFDLEVBQ0QsQ0FBQyxNQUFNLEtBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FDVCxrRUFBa0UsRUFDbEUsTUFBTSxDQUNQLENBQ0osQ0FBQztBQUNKLFNBQUMsQ0FDRixDQUFDO1FBRUYsSUFBSSxTQUFTLEVBQUU7WUFDYixDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsS0FBSTtBQUN2RCxnQkFBQSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFJO0FBQ2pELG9CQUFBLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBRTlCLG9CQUFBLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkMsV0FBVyxFQUNYLEtBQUssRUFDTCxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsRUFDZixLQUFLLEVBQ0wsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQ2IsSUFBSSxFQUNKLENBQUMsS0FBSyxFQUFFLE1BQU0sS0FBSTtBQUNoQix3QkFBQSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzt3QkFDOUIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2hCLHFCQUFDLENBQ0YsQ0FBQztBQUVGLG9CQUFBLE9BQU8sQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUM5QyxpQkFBQyxDQUFDLENBQUM7QUFDTCxhQUFDLENBQUMsQ0FBQztTQUNKO0tBQ0Y7SUFFRCx5QkFBeUIsQ0FDdkIsV0FBd0IsRUFDeEIsTUFBNEIsRUFBQTtRQUU1QixJQUFJLENBQUMsZ0JBQWdCLENBQ25CLFdBQVcsRUFDWCw0QkFBNEIsRUFDNUIsNEZBQTRGLEVBQzVGLE1BQU0sQ0FBQyxZQUFZLENBQUMsdUJBQXVCLEVBQzNDLElBQUksRUFDSixDQUFDLEtBQUssRUFBRSxNQUFNLEtBQUk7QUFDaEIsWUFBQSxNQUFNLENBQUMsWUFBWSxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztZQUNwRCxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDaEIsU0FBQyxDQUNGLENBQUM7S0FDSDtJQUVELHNCQUFzQixDQUFDLFdBQXdCLEVBQUUsTUFBNEIsRUFBQTtRQUMzRSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSx1QkFBdUIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUU3RCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQ2pDLFdBQVcsRUFDWCx1QkFBdUIsRUFDdkIsZ0VBQWdFLEVBQ2hFLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsRUFDNUMsSUFBSSxFQUNKLENBQUMsS0FBSyxFQUFFLE1BQU0sS0FBSTtBQUNoQixZQUFBLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7WUFDckQsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2hCLFNBQUMsQ0FDRixDQUFDO0FBQ0YsUUFBQSxPQUFPLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFFNUMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FDN0IsV0FBVyxFQUNYLHNCQUFzQixFQUN0QixtSEFBbUgsRUFDbkgsTUFBTSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixFQUMzQyxJQUFJLEVBQ0osQ0FBQyxLQUFLLEVBQUUsTUFBTSxLQUFJO0FBQ2hCLFlBQUEsTUFBTSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztZQUNwRCxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDaEIsU0FBQyxDQUNGLENBQUM7QUFDRixRQUFBLE9BQU8sQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQztLQUM3QztBQUNGOztBQ2pVSyxNQUFPLDJCQUE0QixTQUFRLGtCQUFrQixDQUFBO0FBQ2pFLElBQUEsT0FBTyxDQUFDLFdBQXdCLEVBQUE7QUFDOUIsUUFBQSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBRXhCLFFBQUEsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsOEJBQThCLENBQUMsQ0FBQztBQUVsRSxRQUFBLElBQUksQ0FBQyxjQUFjLENBQ2pCLFdBQVcsRUFDWCw2QkFBNkIsRUFDN0IsaUVBQWlFLEVBQ2pFLE1BQU0sQ0FBQyxvQkFBb0IsRUFDM0Isc0JBQXNCLEVBQ3RCLE1BQU0sQ0FBQyw0QkFBNEIsQ0FDcEMsQ0FBQztLQUNIO0FBQ0Y7O0FDZEssTUFBTyx3QkFBeUIsU0FBUSxrQkFBa0IsQ0FBQTtBQUM5RCxJQUFBLE9BQU8sQ0FBQyxXQUF3QixFQUFBO0FBQzlCLFFBQUEsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztBQUV4QixRQUFBLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLDJCQUEyQixDQUFDLENBQUM7QUFFL0QsUUFBQSxJQUFJLENBQUMsY0FBYyxDQUNqQixXQUFXLEVBQ1gsMEJBQTBCLEVBQzFCLDhEQUE4RCxFQUM5RCxNQUFNLENBQUMsaUJBQWlCLEVBQ3hCLG1CQUFtQixFQUNuQixNQUFNLENBQUMseUJBQXlCLENBQ2pDLENBQUM7QUFFRixRQUFBLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFcEQsUUFBQSxJQUFJLENBQUMsZ0JBQWdCLENBQ25CLFdBQVcsRUFDWCxxREFBcUQsRUFDckQscUZBQXFGLEVBQ3JGLE1BQU0sQ0FBQywyQkFBMkIsRUFDbEMsNkJBQTZCLENBQzlCLENBQUM7S0FDSDtJQUVELHlCQUF5QixDQUN2QixXQUF3QixFQUN4QixNQUE0QixFQUFBO1FBRTVCLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BGLFFBQUEsTUFBTSxJQUFJLEdBQUcsQ0FBbUksZ0lBQUEsRUFBQSxZQUFZLEVBQUUsQ0FBQztRQUUvSixJQUFJLENBQUMsa0JBQWtCLENBQ3JCLFdBQVcsRUFDWCwwQkFBMEIsRUFDMUIsSUFBSSxFQUNKLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQzNDLDJCQUEyQixFQUMzQixNQUFNLENBQUMsb0NBQW9DLENBQzVDLENBQUM7S0FDSDtBQUNGOztBQ3pDSyxNQUFPLDBCQUEyQixTQUFRLGtCQUFrQixDQUFBO0FBQ2hFLElBQUEsT0FBTyxDQUFDLFdBQXdCLEVBQUE7QUFDOUIsUUFBQSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBRXhCLFFBQUEsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztBQUVqRSxRQUFBLElBQUksQ0FBQyxjQUFjLENBQ2pCLFdBQVcsRUFDWCw0QkFBNEIsRUFDNUIsZ0VBQWdFLEVBQ2hFLE1BQU0sQ0FBQyxtQkFBbUIsRUFDMUIscUJBQXFCLEVBQ3JCLE1BQU0sQ0FBQywyQkFBMkIsQ0FDbkMsQ0FBQztBQUVGLFFBQUEsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUU5QyxRQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsV0FBVyxFQUNYLGtCQUFrQixFQUNsQiw2SEFBNkgsRUFDN0gsTUFBTSxDQUFDLHFCQUFxQixFQUM1Qix1QkFBdUIsQ0FDeEIsQ0FBQztBQUVGLFFBQUEsSUFBSSxDQUFDLGdCQUFnQixDQUNuQixXQUFXLEVBQ1gsa0JBQWtCLEVBQ2xCLDhGQUE4RixFQUM5RixNQUFNLENBQUMscUJBQXFCLEVBQzVCLHVCQUF1QixDQUN4QixDQUFDO1FBRUYsSUFBSSxDQUFDLGdCQUFnQixDQUNuQixXQUFXLEVBQ1gsMEJBQTBCLEVBQzFCLHlFQUF5RSxFQUN6RSxNQUFNLENBQUMsOEJBQThCLEVBQ3JDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFDVixnQ0FBZ0MsQ0FDakMsQ0FBQztBQUVGLFFBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUU3QyxRQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsV0FBVyxFQUNYLGdDQUFnQyxFQUNoQyxnTUFBZ00sRUFDaE0sTUFBTSxDQUFDLDJCQUEyQixFQUNsQyw2QkFBNkIsQ0FDOUIsQ0FBQztBQUVGLFFBQUEsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNoRDtJQUVELG1CQUFtQixDQUFDLFdBQXdCLEVBQUUsTUFBNEIsRUFBQTtBQUN4RSxRQUFBLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztBQUU5QyxRQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsV0FBVyxFQUNYLGlCQUFpQixFQUNqQiw0RkFBNEYsRUFDNUYsU0FBUyxFQUNULElBQUksRUFDSixDQUFDLFNBQVMsRUFBRSxNQUFNLEtBQUk7QUFDcEIsWUFBQSxNQUFNLENBQUMsb0JBQW9CLEdBQUcsU0FBUyxDQUFDOzs7QUFJeEMsWUFBQSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxDQUN4QixNQUFLOzs7QUFHSCxnQkFBQSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2pDLGFBQUMsRUFDRCxDQUFDLE1BQU0sS0FDTCxPQUFPLENBQUMsR0FBRyxDQUFDLHNEQUFzRCxFQUFFLE1BQU0sQ0FBQyxDQUM5RSxDQUFDO0FBQ0osU0FBQyxDQUNGLENBQUM7UUFFRixJQUFJLFNBQVMsRUFBRTtBQUNiLFlBQUEsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUNqQyxXQUFXLEVBQ1gsNEJBQTRCLEVBQzVCLDBRQUEwUSxFQUMxUSxNQUFNLENBQUMsa0JBQWtCLEVBQ3pCLG9CQUFvQixDQUNyQixDQUFDO0FBRUYsWUFBQSxPQUFPLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFFNUMsWUFBQSxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUM3QixXQUFXLEVBQ1gscUJBQXFCLEVBQ3JCLHVIQUF1SCxFQUN2SCxNQUFNLENBQUMsaUJBQWlCLEVBQ3hCLG1CQUFtQixDQUNwQixDQUFDO0FBRUYsWUFBQSxPQUFPLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUM7U0FDN0M7S0FDRjtJQUVELG9CQUFvQixDQUFDLFdBQXdCLEVBQUUsTUFBNEIsRUFBQTtBQUN6RSxRQUFBLElBQUksQ0FBQyxhQUFhLENBQ2hCLFdBQVcsRUFDWCx5QkFBeUIsRUFDekIsNE9BQTRPLENBQzdPLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxLQUFJO0FBQ3pCLFlBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsTUFBSztnQkFDakQsTUFBTSxTQUFTLEdBQUcsUUFBUTtBQUN2QixxQkFBQSxRQUFRLEVBQUU7cUJBQ1YsS0FBSyxDQUFDLElBQUksQ0FBQztxQkFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3BCLHFCQUFBLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRS9CLGdCQUFBLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7Z0JBQ3BDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNoQixhQUFDLENBQUMsQ0FBQztBQUNMLFNBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxrQkFBa0IsQ0FBQyxXQUF3QixFQUFFLE1BQTRCLEVBQUE7UUFDdkUsTUFBTSxXQUFXLEdBQUcsaUJBQWlCLENBQUM7QUFFdEMsUUFBQSxJQUFJLENBQUMsYUFBYSxDQUNoQixXQUFXLEVBQ1gsV0FBVyxFQUNYLDhLQUE4SyxDQUMvSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsS0FBSTtBQUN6QixZQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwRCxRQUFRLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxNQUFLO2dCQUNqRCxNQUFNLFFBQVEsR0FBRyxRQUFRO0FBQ3RCLHFCQUFBLFFBQVEsRUFBRTtxQkFDVixLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ1gscUJBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRS9CLElBQUksSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsRUFBRTtBQUN6RCxvQkFBQSxNQUFNLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQztvQkFDakMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUNmO0FBQ0gsYUFBQyxDQUFDLENBQUM7QUFDTCxTQUFDLENBQUMsQ0FBQztLQUNKO0lBRUQseUJBQXlCLENBQUMsV0FBbUIsRUFBRSxRQUFrQixFQUFBO1FBQy9ELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQztRQUNuQixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFFbkIsUUFBQSxLQUFLLE1BQU0sR0FBRyxJQUFJLFFBQVEsRUFBRTtBQUMxQixZQUFBLElBQUk7QUFDRixnQkFBQSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNqQjtZQUFDLE9BQU8sR0FBRyxFQUFFOztBQUVaLGdCQUFBLFNBQVMsSUFBSSxDQUE2QiwwQkFBQSxFQUFBLEdBQUcsQ0FBZSxZQUFBLEVBQUEsR0FBRyxZQUFZLENBQUM7Z0JBQzVFLE9BQU8sR0FBRyxLQUFLLENBQUM7YUFDakI7U0FDRjtRQUVELElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixNQUFNLEtBQUssR0FBRyxJQUFJQSxjQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLFlBQUEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBbUUsZ0VBQUEsRUFBQSxTQUFTLEVBQUUsQ0FBQztZQUMzRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDZDtBQUVELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7QUFDRjs7QUMxS0ssTUFBTyx3QkFBeUIsU0FBUSxrQkFBa0IsQ0FBQTtBQUM5RCxJQUFBLE9BQU8sQ0FBQyxXQUF3QixFQUFBO0FBQzlCLFFBQUEsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztBQUV4QixRQUFBLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLDJCQUEyQixDQUFDLENBQUM7QUFFL0QsUUFBQSxJQUFJLENBQUMsY0FBYyxDQUNqQixXQUFXLEVBQ1gsMEJBQTBCLEVBQzFCLCtQQUErUCxFQUMvUCxNQUFNLENBQUMsaUJBQWlCLEVBQ3hCLG1CQUFtQixFQUNuQixNQUFNLENBQUMseUJBQXlCLENBQ2pDLENBQUM7QUFFRixRQUFBLElBQUksQ0FBQyxjQUFjLENBQ2pCLFdBQVcsRUFDWCwrQ0FBK0MsRUFDL0MscUlBQXFJLEVBQ3JJLE1BQU0sQ0FBQyw2QkFBNkIsRUFDcEMsK0JBQStCLEVBQy9CLE1BQU0sQ0FBQyw2QkFBNkIsQ0FDckMsQ0FBQztBQUVGLFFBQUEsSUFBSSxDQUFDLGdCQUFnQixDQUNuQixXQUFXLEVBQ1gsa0NBQWtDLEVBQ2xDLHdNQUF3TSxFQUN4TSxNQUFNLENBQUMsa0JBQWtCLEVBQ3pCLG9CQUFvQixDQUNyQixDQUFDO0FBRUYsUUFBQSxJQUFJLENBQUMsZ0JBQWdCLENBQ25CLFdBQVcsRUFDWCx5QkFBeUIsRUFDekIsdUhBQXVILEVBQ3ZILE1BQU0sQ0FBQyxzQkFBc0IsRUFDN0Isd0JBQXdCLENBQ3pCLENBQUM7QUFFRixRQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsV0FBVyxFQUNYLDhDQUE4QyxFQUM5Qyx3SkFBd0osRUFDeEosTUFBTSxDQUFDLDhCQUE4QixFQUNyQyxnQ0FBZ0MsQ0FDakMsQ0FBQztBQUVGLFFBQUEsSUFBSSxDQUFDLGdCQUFnQixDQUNuQixXQUFXLEVBQ1gsNkJBQTZCLEVBQzdCLGlLQUFpSyxFQUNqSyxNQUFNLENBQUMsb0JBQW9CLEVBQzNCLHNCQUFzQixDQUN2QixDQUFDO0FBRUYsUUFBQSxJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3RELFFBQUEsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNqRDtJQUVELDJCQUEyQixDQUN6QixXQUF3QixFQUN4QixNQUE0QixFQUFBO0FBRTVCLFFBQUEsTUFBTSxjQUFjLEdBQTJCO0FBQzdDLFlBQUEsQ0FBQyxlQUFlLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQztBQUNyQyxZQUFBLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUM7QUFDN0IsWUFBQSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDO0FBQ2pDLFlBQUEsQ0FBQyxlQUFlLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQztTQUN0QyxDQUFDO1FBRUYsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxLQUFJO1lBQzVDLElBQUksQ0FBQyxnQkFBZ0IsQ0FDbkIsV0FBVyxFQUNYLElBQUksRUFDSixFQUFFLEVBQ0YsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxFQUN0QyxJQUFJLEVBQ0osQ0FBQyxTQUFTLEtBQUk7QUFDWixnQkFBQSxNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNuRCxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDaEIsYUFBQyxDQUNGLENBQUM7QUFDSixTQUFDLENBQUMsQ0FBQztLQUNKO0lBRUQscUJBQXFCLENBQUMsV0FBd0IsRUFBRSxNQUE0QixFQUFBO1FBQzFFLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFbkUsUUFBQSxJQUFJLENBQUMsZ0JBQWdCLENBQ25CLFdBQVcsRUFDWCxZQUFZLEVBQ1osRUFBRSxFQUNGLGNBQWMsRUFDZCxJQUFJLEVBQ0osQ0FBQyxTQUFTLEtBQUk7WUFDWixNQUFNLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQzs7O0FBSXhELFlBQUEsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksQ0FDeEIsTUFBSzs7O0FBR0gsZ0JBQUEsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNqQyxhQUFDLEVBQ0QsQ0FBQyxNQUFNLEtBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpREFBaUQsRUFBRSxNQUFNLENBQUMsQ0FDekUsQ0FBQztBQUNKLFNBQUMsQ0FDRixDQUFDO1FBRUYsSUFBSSxjQUFjLEVBQUU7QUFDbEIsWUFBQSxNQUFNLGdCQUFnQixHQUF1QjtBQUMzQyxnQkFBQSxDQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUM7QUFDdkMsZ0JBQUEsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDO2FBQ3BDLENBQUM7WUFFRixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsS0FBSTtnQkFDNUMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEdBQUcsUUFBUSxNQUFNLFFBQVEsQ0FBQztBQUN4RSxnQkFBQSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQ25DLFdBQVcsRUFDWCxJQUFJLEVBQ0osRUFBRSxFQUNGLENBQUMsVUFBVSxFQUNYLElBQUksRUFDSixDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUNqRSxDQUFDO0FBRUYsZ0JBQUEsT0FBTyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQzlDLGFBQUMsQ0FBQyxDQUFDO1NBQ0o7S0FDRjtJQUVELHVCQUF1QixDQUFDLFFBQWtCLEVBQUUsU0FBa0IsRUFBQTtBQUM1RCxRQUFBLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDeEIsUUFBQSxJQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUM7UUFFNUMsSUFBSSxTQUFTLEVBQUU7O1lBRWIsVUFBVSxJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ3pCO2FBQU07O1lBRUwsVUFBVSxJQUFJLFFBQVEsQ0FBQztTQUN4QjtBQUVELFFBQUEsTUFBTSxDQUFDLG1CQUFtQixHQUFHLFVBQVUsQ0FBQztRQUN4QyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDZjtBQUNGOztBQ3ZKSyxNQUFPLDJCQUE0QixTQUFRLGtCQUFrQixDQUFBO0FBQ2pFLElBQUEsT0FBTyxDQUFDLFdBQXdCLEVBQUE7QUFDOUIsUUFBQSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRXhCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLDBCQUEwQixDQUFDLENBQUM7QUFDbkYsUUFBQSxZQUFZLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztBQUM5QixZQUFBLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUM7QUFDL0IsWUFBQSxJQUFJLEVBQUUsY0FBYztBQUNyQixTQUFBLENBQUMsQ0FBQztBQUVILFFBQUEsSUFBSSxDQUFDLGNBQWMsQ0FDakIsV0FBVyxFQUNYLHlCQUF5QixFQUN6Qiw2REFBNkQsRUFDN0QsTUFBTSxDQUFDLGdCQUFnQixFQUN2QixrQkFBa0IsRUFDbEIsTUFBTSxDQUFDLHdCQUF3QixDQUNoQyxDQUFDO0tBQ0g7QUFDRjs7QUNDSyxNQUFPLHNCQUF1QixTQUFRQyx5QkFBZ0IsQ0FBQTtBQUMxRCxJQUFBLFdBQUEsQ0FDRSxHQUFRLEVBQ0QsTUFBMEIsRUFDekIsTUFBNEIsRUFBQTtBQUVwQyxRQUFBLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFIWixJQUFNLENBQUEsTUFBQSxHQUFOLE1BQU0sQ0FBb0I7UUFDekIsSUFBTSxDQUFBLE1BQUEsR0FBTixNQUFNLENBQXNCO0tBR3JDO0lBRUQsT0FBTyxHQUFBO0FBQ0wsUUFBQSxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQzdCLFFBQUEsTUFBTSxXQUFXLEdBQUc7WUFDbEIseUJBQXlCO1lBQ3pCLHdCQUF3QjtZQUN4QiwwQkFBMEI7WUFDMUIsd0JBQXdCO1lBQ3hCLDhCQUE4QjtZQUM5QiwyQkFBMkI7WUFDM0IsNkJBQTZCO1lBQzdCLDJCQUEyQjtZQUMzQiwyQkFBMkI7U0FDNUIsQ0FBQztRQUVGLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQixXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSwyQkFBMkIsRUFBRSxDQUFDLENBQUM7QUFFbEUsUUFBQSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsZUFBZSxLQUFJO0FBQ3RDLFlBQUEsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzFDLFNBQUMsQ0FBQyxDQUFDO0tBQ0o7QUFFRCxJQUFBLGlCQUFpQixDQUFDLGVBQWdELEVBQUE7UUFDaEUsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQzFDLE1BQU0sVUFBVSxHQUFHLElBQUksZUFBZSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDMUQsUUFBQSxVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ2pDO0FBQ0Y7O01DcENZLFNBQVMsQ0FBQTtBQUtaLElBQUEsV0FBVyxvQkFBb0IsR0FBQTtRQUNyQyxPQUFPO0FBQ0wsWUFBQSxXQUFXLEVBQUUsS0FBSztZQUNsQixLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ1QsWUFBQSxXQUFXLEVBQUUsSUFBSTtTQUNsQixDQUFDO0tBQ0g7QUFZRCxJQUFBLElBQUksV0FBVyxHQUFBO1FBQ2IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0tBQzFCO0FBRUQsSUFBQSxJQUFJLHVCQUF1QixHQUFBO0FBQ3pCLFFBQUEsT0FBTyxJQUFJLENBQUMsd0JBQXdCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQztLQUN4RDtJQUVELElBQUksdUJBQXVCLENBQUMsS0FBYSxFQUFBO0FBQ3ZDLFFBQUEsSUFBSSxDQUFDLHdCQUF3QixHQUFHLEtBQUssQ0FBQztLQUN2QztJQUVELFdBQ1MsQ0FBQSxTQUFBLEdBQVksRUFBRSxFQUNkLElBQUEsR0FBTyxJQUFJLENBQUMsUUFBUSxFQUMzQixXQUF5QixFQUFBO1FBRmxCLElBQVMsQ0FBQSxTQUFBLEdBQVQsU0FBUyxDQUFLO1FBQ2QsSUFBSSxDQUFBLElBQUEsR0FBSixJQUFJLENBQWdCO1FBbENyQixJQUF3QixDQUFBLHdCQUFBLEdBQVcsSUFBSSxDQUFDO0FBV3ZDLFFBQUEsSUFBQSxDQUFBLHVCQUF1QixHQUFxQjtZQUNuRCxtQkFBbUIsRUFBRSxJQUFJLEdBQUcsRUFBaUI7WUFDN0Msa0JBQWtCLEVBQUUsSUFBSSxHQUFHLEVBQVM7WUFDcEMsYUFBYSxFQUFFLElBQUksR0FBRyxFQUE4QjtZQUNwRCxnQkFBZ0IsRUFBRSxJQUFJLEdBQUcsRUFBcUI7WUFDOUMsZUFBZSxFQUFFLElBQUksR0FBRyxFQUFTO1lBQ2pDLHdCQUF3QixFQUFFLElBQUksR0FBRyxFQUFVO1NBQzVDLENBQUM7QUFtQkEsUUFBQSxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsSUFBSSxFQUFFLENBQUM7QUFDckMsUUFBQSxNQUFNLGFBQWEsR0FBeUI7WUFDMUMsR0FBRyxTQUFTLENBQUMsb0JBQW9CO0FBQ2pDLFlBQUEsTUFBTSxFQUFFLElBQUk7U0FDYixDQUFDO0FBRUYsUUFBQSxNQUFNLG1CQUFtQixHQUF5QjtZQUNoRCxHQUFHLFNBQVMsQ0FBQyxvQkFBb0I7QUFDakMsWUFBQSxNQUFNLEVBQUUsSUFBSTtTQUNiLENBQUM7UUFFRixNQUFNLFVBQVUsR0FBRyxFQUFpQyxDQUFDO0FBQ3JELFFBQUEsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUM7QUFDakMsUUFBQSxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLGFBQWEsQ0FBQztBQUM1QyxRQUFBLFVBQVUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxtQkFBbUIsQ0FBQztBQUV4RCxRQUFBO0FBQ0UsWUFBQSxJQUFJLENBQUMsUUFBUTtBQUNiLFlBQUEsSUFBSSxDQUFDLFVBQVU7QUFDZixZQUFBLElBQUksQ0FBQyxhQUFhO0FBQ2xCLFlBQUEsSUFBSSxDQUFDLFlBQVk7QUFDakIsWUFBQSxJQUFJLENBQUMsYUFBYTtBQUNsQixZQUFBLElBQUksQ0FBQyxXQUFXO0FBQ2hCLFlBQUEsSUFBSSxDQUFDLFNBQVM7QUFDZixTQUFBLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFJO0FBQ2pCLFlBQUEsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztBQUNwRCxTQUFDLENBQUMsQ0FBQztLQUNKO0lBRUQsZ0JBQWdCLEdBQUE7QUFDZCxRQUFBLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDdEIsUUFBQSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUM7QUFDMUQsUUFBQSxNQUFNLFNBQVMsR0FBR0MscUJBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUMzRCxNQUFNLGFBQWEsR0FBRyxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFbkQsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsQ0FBQztLQUNsRDtBQUVELElBQUEsYUFBYSxDQUFDLElBQVcsRUFBQTtBQUN2QixRQUFBLElBQUksR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQztBQUN6QixRQUFBLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNsQztBQUNGOztNQ3pEcUIsT0FBTyxDQUFBO0lBRzNCLFdBQ1ksQ0FBQSxHQUFRLEVBQ1IsUUFBOEIsRUFBQTtRQUQ5QixJQUFHLENBQUEsR0FBQSxHQUFILEdBQUcsQ0FBSztRQUNSLElBQVEsQ0FBQSxRQUFBLEdBQVIsUUFBUSxDQUFzQjtLQUN0QztJQWVKLEtBQUssR0FBQTs7S0FFSjtJQUVELHVCQUF1QixDQUNyQixVQUFxQixFQUNyQixJQUFnQyxFQUFBO0FBRWhDLFFBQUEsT0FBTyxLQUFLLENBQUM7S0FDZDtBQUVELElBQUEsU0FBUyxDQUFDLElBQVUsRUFBQTtBQUNsQixRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2hCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQztZQUV6RCxJQUFJLFNBQVMsRUFBRTtnQkFDYixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7YUFDL0U7U0FDRjtBQUVELFFBQUEsT0FBTyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztLQUMxQjtBQUVELElBQUEsa0JBQWtCLENBQUMsU0FBb0IsRUFBQTtRQUNyQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDcEU7SUFFRCxhQUFhLENBQUMsTUFBZSxFQUFFLFFBQWlCLEVBQUE7QUFDOUMsUUFBQSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUUvQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsdUJBQXVCLEVBQUU7QUFDdkQsWUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3RCO0tBQ0Y7QUFFRCxJQUFBLGlCQUFpQixDQUFDLFNBQW9CLEVBQUE7QUFDcEMsUUFBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDO2FBQ2hELE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDO2FBQ3pCLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFcEIsUUFBQSxPQUFPLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzFCO0lBRUQsYUFBYSxDQUFDLGNBQTJCLEVBQUUsT0FBZSxFQUFBO0FBQ3hELFFBQUEsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7QUFDOUMsUUFBQSxPQUFPLENBQUMsZUFBZSxJQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7S0FDN0U7QUFFRCxJQUFBLGFBQWEsQ0FBQyxJQUFtQixFQUFBO0FBQy9CLFFBQUEsTUFBTSxFQUFFLGdCQUFnQixFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUMzQyxJQUFJLElBQUksR0FBVSxJQUFJLENBQUM7UUFDdkIsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksTUFBTSxHQUFtQixJQUFJLENBQUM7UUFFbEMsSUFBSSxJQUFJLEVBQUU7QUFDUixZQUFBLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFFdEIsWUFBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDcEMsWUFBQSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNqQixZQUFBLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7O1lBR3RDLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUlsRSxZQUFBLGFBQWEsR0FBRyxvQkFBb0IsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDO1NBQ2hEO0FBRUQsUUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQztLQUNoRTtBQUVELElBQUEsaUJBQWlCLENBQUMsVUFBeUIsRUFBQTtRQUN6QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDMUQsUUFBQSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBRXJCLFFBQUEsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFOzs7O0FBSXRCLFlBQUEsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtTQUMxRDs7UUFHRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRWxELE9BQU8sRUFBRSxHQUFHLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUM7S0FDbEM7QUFFUyxJQUFBLDJCQUEyQixDQUFDLFVBQXlCLEVBQUE7UUFDN0QsSUFBSSxJQUFJLEdBQVUsSUFBSSxDQUFDO1FBQ3ZCLElBQUksSUFBSSxHQUFrQixJQUFJLENBQUM7OztBQUkvQixRQUFBLE1BQU0sWUFBWSxHQUFHO0FBQ25CLFlBQUEsY0FBYyxDQUFDLFVBQVU7QUFDekIsWUFBQSxjQUFjLENBQUMsVUFBVTtBQUN6QixZQUFBLGNBQWMsQ0FBQyxhQUFhO0FBQzVCLFlBQUEsY0FBYyxDQUFDLFdBQVc7QUFDMUIsWUFBQSxjQUFjLENBQUMsU0FBUztTQUN6QixDQUFDO0FBRUYsUUFBQSxNQUFNLHFCQUFxQixHQUFHLFVBQVUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BGLElBQUkscUJBQXFCLEVBQUU7QUFDekIsWUFBQSxJQUFJLEdBQUksVUFBOEIsQ0FBQyxJQUFJLENBQUM7U0FDN0M7QUFFRCxRQUFBLElBQUksa0JBQWtCLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDbEMsWUFBQSxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztTQUN4QjtBQUVELFFBQUEsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUU3QixPQUFPLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLENBQUM7S0FDbEQ7QUFFRDs7OztBQUlHO0FBQ0gsSUFBQSxpQkFBaUIsQ0FBQyxJQUFVLEVBQUE7UUFDMUIsSUFBSSxNQUFNLEdBQW1CLElBQUksQ0FBQztBQUVsQyxRQUFBLElBQUksSUFBSSxFQUFFLFdBQVcsRUFBRSxLQUFLLFVBQVUsRUFBRTtZQUN0QyxNQUFNLEVBQUUsR0FBRyxJQUFvQixDQUFDO0FBRWhDLFlBQUEsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEtBQUssU0FBUyxFQUFFO0FBQzlCLGdCQUFBLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDdEIsZ0JBQUEsTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbkM7U0FDRjtBQUVELFFBQUEsT0FBTyxNQUFNLENBQUM7S0FDZjtBQUVEOzs7OztBQUtHO0FBQ0gsSUFBQSxZQUFZLENBQUMsVUFBaUIsRUFBQTtBQUM1QixRQUFBLE1BQU0sSUFBSSxHQUFHLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFdkMsUUFBQSxPQUFPLEVBQUUsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDO0tBQzVCO0FBRUQ7Ozs7QUFJRztBQUNILElBQUEsVUFBVSxDQUFDLFVBQWlCLEVBQUE7QUFDMUIsUUFBQSxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDL0Q7QUFFRCxJQUFBLE9BQU8sVUFBVSxDQUNmLFVBQWlCLEVBQ2pCLGFBQTRCLEVBQUE7UUFFNUIsSUFBSSxFQUFFLEdBQWlCLElBQUksQ0FBQztRQUM1QixNQUFNLFdBQVcsR0FDZixhQUFhLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUM7QUFDOUUsWUFBQSxFQUFFLENBQUM7QUFFTCxRQUFBLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRTtZQUN0QixFQUFFLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUk7Z0JBQ3BDLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQy9DLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFFeEMsT0FBTyxRQUFRLEdBQUcsT0FBTyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7QUFDekMsYUFBQyxDQUFDLENBQUM7U0FDSjtBQUVELFFBQUEsT0FBTyxFQUFFLENBQUM7S0FDWDtBQUVEOzs7Ozs7QUFNRztBQUNILElBQUEsZ0JBQWdCLENBQ2QsSUFBVyxFQUNYLElBQW9CLEVBQ3BCLHFCQUFxQixHQUFHLEtBQUssRUFBQTtRQUU3QixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDeEIsUUFBQSxNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzdCLFFBQUEsTUFBTSxFQUNKLFFBQVEsRUFBRSxFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSx5QkFBeUIsRUFBRSxHQUMxRSxHQUFHLElBQUksQ0FBQztBQUVULFFBQUEsTUFBTSxPQUFPLEdBQUcsQ0FBQyxhQUE0QixLQUFJO1lBQy9DLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQztBQUVoQixZQUFBLElBQUksYUFBYSxFQUFFLElBQUksRUFBRTtBQUN2QixnQkFBQSxNQUFNLGtCQUFrQixHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQ2hELGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQ2pDLENBQUM7QUFDRixnQkFBQSxNQUFNLGdCQUFnQixHQUFHLHFCQUFxQixJQUFJLENBQUMsa0JBQWtCLENBQUM7QUFDdEUsZ0JBQUEsTUFBTSxlQUFlLEdBQ25CLGFBQWEsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFFcEUsSUFBSSxnQkFBZ0IsRUFBRTtvQkFDcEIsSUFBSSxhQUFhLEtBQUsscUJBQXFCLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRTtBQUNoRSx3QkFBQSxHQUFHLEdBQUcsYUFBYSxLQUFLLElBQUksQ0FBQztxQkFDOUI7eUJBQU07d0JBQ0wsR0FBRyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQztxQkFDeEM7aUJBQ0Y7YUFDRjtBQUVELFlBQUEsT0FBTyxHQUFHLENBQUM7QUFDYixTQUFDLENBQUM7O0FBR0YsUUFBQSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDeEMsUUFBQSxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN2QixZQUFZLEdBQUcsVUFBVSxDQUFDO1NBQzNCO2FBQU07WUFDTCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLHlCQUF5QixDQUFDLENBQUM7O0FBRy9FLFlBQUEsWUFBWSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2hEO1FBRUQsT0FBTztZQUNMLElBQUksRUFBRSxZQUFZLElBQUksSUFBSTtZQUMxQixJQUFJO0FBQ0osWUFBQSxVQUFVLEVBQUUsSUFBSTtBQUNoQixZQUFBLGFBQWEsRUFBRSxLQUFLO1NBQ3JCLENBQUM7S0FDSDtBQUVEOzs7OztBQUtHO0FBQ0gsSUFBQSx3QkFBd0IsQ0FDdEIsR0FBK0IsRUFDL0IsYUFBdUIsRUFDdkIsSUFBVyxFQUFBO0FBRVgsUUFBQSxNQUFNLGNBQWMsR0FBbUIsR0FBRyxFQUFFLFFBQVEsR0FBRyxZQUFZLEdBQUcsVUFBVSxDQUFDO0FBRWpGLFFBQUEsTUFBTSxHQUFHLEdBQUksR0FBcUIsRUFBRSxHQUFHLENBQUM7UUFDeEMsSUFBSSxPQUFPLEdBQUdDLGVBQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDO1FBRTlDLElBQUksT0FBTyxLQUFLLElBQUksSUFBSSxPQUFPLEtBQUssS0FBSyxFQUFFO0FBQ3pDLFlBQUEsSUFBSSxHQUFHLEtBQUssR0FBRyxFQUFFOztnQkFFZixPQUFPLEdBQUcsUUFBUSxDQUFDO2FBQ3BCO0FBQU0saUJBQUEsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFOztnQkFFdkIsT0FBTyxHQUFHLE9BQU8sQ0FBQzthQUNuQjtTQUNGO1FBRUQsT0FBTyxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3pFLFFBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsQ0FBQztLQUNwQztBQUVEOzs7Ozs7O0FBT0c7QUFDSCxJQUFBLDJCQUEyQixDQUN6QixPQUEyQixFQUMzQixhQUFhLEdBQUcsS0FBSyxFQUNyQixJQUFXLEVBQUE7UUFFWCxJQUFJLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztRQUMvQixNQUFNLEVBQUUsa0JBQWtCLEVBQUUsc0JBQXNCLEVBQUUsOEJBQThCLEVBQUUsR0FDbEYsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUVoQixRQUFBLElBQUksT0FBTyxLQUFLLEtBQUssRUFBRTtZQUNyQixJQUFJLGtCQUFrQixFQUFFO2dCQUN0QixnQkFBZ0IsR0FBRyxDQUFDLGFBQWEsQ0FBQzthQUNuQztBQUFNLGlCQUFBLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ25DLGdCQUFnQixHQUFHQyxpQkFBUSxDQUFDLFFBQVE7c0JBQ2hDLENBQUMsOEJBQThCO3NCQUMvQixzQkFBc0IsQ0FBQzthQUM1QjtTQUNGO0FBRUQsUUFBQSxPQUFPLGdCQUFnQixDQUFDO0tBQ3pCO0FBRUQ7Ozs7O0FBS0c7QUFDSCxJQUFBLGVBQWUsQ0FBQyxJQUFtQixFQUFBO0FBQ2pDLFFBQUEsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDL0IsUUFBQSxNQUFNLElBQUksR0FBRyxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDN0IsT0FBTyxJQUFJLEtBQUssU0FBUyxDQUFDLFNBQVMsSUFBSSxJQUFJLEtBQUssU0FBUyxDQUFDLGFBQWEsQ0FBQztLQUN6RTtBQUVEOzs7Ozs7QUFNRztJQUNILFlBQVksQ0FBQyxJQUFtQixFQUFFLE1BQWdDLEVBQUE7QUFDaEUsUUFBQSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUMvQixNQUFNLGFBQWEsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEQsTUFBTSxLQUFLLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFFekMsSUFBSSxhQUFhLEVBQUU7QUFDakIsWUFBQSxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzVCO1FBRUQsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUMvQyxRQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEM7QUFFRDs7Ozs7O0FBTUc7QUFDSCxJQUFBLGFBQWEsQ0FDWCx5QkFBb0MsRUFDcEMseUJBQW9DLEVBQ3BDLE9BQXlDLEVBQUE7UUFFekMsTUFBTSxNQUFNLEdBQW9CLEVBQUUsQ0FBQztBQUVuQyxRQUFBLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBZ0IsS0FBSTtZQUNwQyxNQUFNLFFBQVEsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDO0FBRXhDLFlBQUEsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMzQixJQUFJLENBQUMseUJBQXlCLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ2xELG9CQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2hCO2FBQ0Y7QUFBTSxpQkFBQSxJQUFJLHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUN4RCxnQkFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2hCO0FBQ0gsU0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFOUMsUUFBQSxJQUFJLE9BQU8sRUFBRSxpQkFBaUIsRUFBRTtZQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSTtBQUNuQixnQkFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLEVBQUUsVUFBVSxJQUFJLENBQUMsQ0FBQztBQUM5QixnQkFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLEVBQUUsVUFBVSxJQUFJLENBQUMsQ0FBQztnQkFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLGFBQUMsQ0FBQyxDQUFDO1NBQ0o7QUFFRCxRQUFBLE9BQU8sTUFBTSxDQUFDO0tBQ2Y7QUFFRDs7Ozs7Ozs7QUFRRztJQUNILE1BQU0sY0FBYyxDQUNsQixJQUFXLEVBQ1gsT0FBMkIsRUFDM0IsU0FBeUIsRUFDekIsY0FBQSxHQUFpQyxVQUFVLEVBQUE7QUFFM0MsUUFBQSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUMvQixRQUFBLE1BQU0sSUFBSSxHQUNSLE9BQU8sS0FBSyxPQUFPO2NBQ2YsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDO0FBQzVDLGNBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVqQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQ3RDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkc7QUFDSCxJQUFBLHdCQUF3QixDQUN0QixHQUErQixFQUMvQixJQUFXLEVBQ1gsWUFBb0IsRUFDcEIsU0FBeUIsRUFDekIsSUFBb0IsRUFDcEIsSUFBVyxFQUNYLHFCQUFxQixHQUFHLEtBQUssRUFBQTtRQUU3QixJQUFJLENBQUMsNkJBQTZCLENBQ2hDLEdBQUcsRUFDSCxJQUFJLEVBQ0osU0FBUyxFQUNULElBQUksRUFDSixJQUFJLEVBQ0oscUJBQXFCLENBQ3RCLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxLQUFJO1lBQ2pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQSwyQ0FBQSxFQUE4QyxZQUFZLENBQUUsQ0FBQSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3BGLFNBQUMsQ0FBQyxDQUFDO0tBQ0o7QUFFRDs7Ozs7Ozs7Ozs7Ozs7O0FBZUc7QUFDSCxJQUFBLE1BQU0sNkJBQTZCLENBQ2pDLEdBQStCLEVBQy9CLElBQVcsRUFDWCxTQUF5QixFQUN6QixJQUFvQixFQUNwQixJQUFXLEVBQ1gscUJBQXFCLEdBQUcsS0FBSyxFQUFBO0FBRTdCLFFBQUEsTUFBTSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3RGLFFBQUEsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQztBQUVuQyxRQUFBLE1BQU0sRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUMvRCxHQUFHLEVBQ0gsYUFBYSxFQUNiLElBQUksQ0FDTCxDQUFDO0FBRUYsUUFBQSxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FDL0IsT0FBTyxFQUNQLElBQUksRUFDSixVQUFVLEVBQ1YsU0FBUyxFQUNULGNBQWMsQ0FDZixDQUFDO0tBQ0g7QUFFRDs7Ozs7Ozs7OztBQVVHO0lBQ0gsTUFBTSxzQkFBc0IsQ0FDMUIsT0FBMkIsRUFDM0IsSUFBVyxFQUNYLElBQW9CLEVBQ3BCLFNBQXlCLEVBQ3pCLGNBQStCLEVBQUE7O1FBRy9CLFNBQVMsR0FBRyxTQUFTLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUM7QUFFakYsUUFBQSxJQUFJLElBQUksSUFBSSxPQUFPLEtBQUssS0FBSyxFQUFFO0FBQzdCLFlBQUEsTUFBTSxNQUFNLEdBQUcsU0FBUyxFQUFFLE1BQWlDLENBQUM7QUFDNUQsWUFBQSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNqQzthQUFNO0FBQ0wsWUFBQSxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7U0FDckU7S0FDRjtBQUVEOzs7Ozs7Ozs7Ozs7QUFZRztJQUNILFVBQVUsQ0FDUixRQUFxQixFQUNyQixJQUFXLEVBQ1gsdUJBQWlDLEVBQ2pDLEtBQW9CLEVBQ3BCLGtCQUE0QixFQUFBO0FBRTVCLFFBQUEsSUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO1lBQ3BCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDcEMsWUFBQSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDO0FBQzdDLFlBQUEsSUFBSSxRQUFRLEdBQ1YsTUFBTSxLQUFLLGlCQUFpQixDQUFDLElBQUksS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUVoRixJQUFJLGtCQUFrQixFQUFFO0FBQ3RCLGdCQUFBLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQywwQkFBMEIsQ0FBQztnQkFDdEQsUUFBUSxHQUFHLEtBQUssQ0FBQzthQUNsQjtZQUVELElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixnQkFBQSxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQy9FLGdCQUFBLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLHVCQUF1QixDQUFDLENBQUM7QUFFNUUsZ0JBQUEsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3JFLGdCQUFBQyxnQkFBTyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUUxQixnQkFBQSxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDekQsZ0JBQUFDLHNCQUFhLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNwQztTQUNGO0tBQ0Y7QUFFRDs7Ozs7OztBQU9HO0FBQ0gsSUFBQSxrQkFBa0IsQ0FDaEIsSUFBVyxFQUNYLGFBQWdDLEVBQ2hDLHVCQUFpQyxFQUFBO1FBRWpDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUVkLElBQUksSUFBSSxFQUFFO0FBQ1IsWUFBQSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFlBQUEsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUM1QixZQUFBLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7QUFHL0IsWUFBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFFL0MsUUFBUSxhQUFhO2dCQUNuQixLQUFLLGlCQUFpQixDQUFDLGtCQUFrQjtvQkFDdkMsSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFHLEVBQUEsSUFBSSxDQUFDLElBQUksQ0FBRSxDQUFBLEdBQUdDLHNCQUFhLENBQUMsQ0FBQSxFQUFHLE9BQU8sQ0FBQSxDQUFBLEVBQUksSUFBSSxDQUFDLElBQUksQ0FBRSxDQUFBLENBQUMsQ0FBQztvQkFDMUUsTUFBTTtnQkFDUixLQUFLLGlCQUFpQixDQUFDLFVBQVU7b0JBQy9CLElBQUksR0FBRyxNQUFNLEdBQUcsUUFBUSxHQUFHLE9BQU8sQ0FBQztvQkFDbkMsTUFBTTtnQkFDUixLQUFLLGlCQUFpQixDQUFDLElBQUk7QUFDekIsb0JBQUEsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQ2pCLE1BQU07Z0JBQ1IsS0FBSyxpQkFBaUIsQ0FBQywwQkFBMEI7b0JBQy9DLElBQUksdUJBQXVCLEVBQUU7QUFDM0Isd0JBQUEsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7d0JBRW5CLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCw0QkFBQSxJQUFJLElBQUksUUFBUSxDQUFDO3lCQUNsQjtxQkFDRjt5QkFBTTt3QkFDTCxJQUFJLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDOUQ7b0JBQ0QsTUFBTTthQUNUO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sSUFBSSxDQUFDO0tBQ2I7QUFFRDs7Ozs7Ozs7O0FBU0c7QUFDSCxJQUFBLGFBQWEsQ0FDWCxRQUFxQixFQUNyQixPQUFlLEVBQ2YsS0FBbUIsRUFDbkIsTUFBZSxFQUFBO0FBRWYsUUFBQSxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO0FBQ25DLFlBQUEsR0FBRyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsYUFBYSxDQUFDO0FBQzNDLFNBQUEsQ0FBQyxDQUFDO0FBRUgsUUFBQSxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO0FBQ2xDLFlBQUEsR0FBRyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsV0FBVyxDQUFDO0FBQ3ZDLFNBQUEsQ0FBQyxDQUFDO1FBRUhELHNCQUFhLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFL0MsUUFBQSxPQUFPLFNBQVMsQ0FBQztLQUNsQjtBQUVEOzs7QUFHRztJQUNILCtCQUErQixDQUFDLFFBQXFCLEVBQUUsZ0JBQTJCLEVBQUE7QUFDaEYsUUFBQSxNQUFNLE1BQU0sR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRS9CLElBQUksZ0JBQWdCLEVBQUU7QUFDcEIsWUFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQztTQUNsQztBQUVELFFBQUEsUUFBUSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUM5QjtBQUVEOzs7Ozs7O0FBT0c7QUFDSCxJQUFBLGtCQUFrQixDQUNoQixTQUF3QixFQUN4QixhQUFxQixFQUNyQixlQUF3QixFQUFBO1FBRXhCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLEtBQUssR0FBaUIsSUFBSSxDQUFDO1FBRS9CLElBQUksYUFBYSxFQUFFO0FBQ2pCLFlBQUEsS0FBSyxHQUFHRSxvQkFBVyxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUM5QyxZQUFBLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3JCO0FBRUQsUUFBQSxJQUFJLENBQUMsS0FBSyxJQUFJLGVBQWUsRUFBRTtBQUM3QixZQUFBLEtBQUssR0FBR0Esb0JBQVcsQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFFaEQsSUFBSSxLQUFLLEVBQUU7QUFDVCxnQkFBQSxLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQzthQUNsQjtTQUNGO1FBRUQsT0FBTztZQUNMLFNBQVM7WUFDVCxLQUFLO1NBQ04sQ0FBQztLQUNIO0FBRUQ7Ozs7Ozs7QUFPRztBQUNILElBQUEsdUJBQXVCLENBQ3JCLFNBQXdCLEVBQ3hCLGFBQXFCLEVBQ3JCLFlBQTJCLEVBQUE7QUFFM0IsUUFBQSxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQy9CLFFBQUEsSUFBSSxTQUFpQixDQUFDO1FBQ3RCLElBQUksS0FBSyxHQUFpQixJQUFJLENBQUM7UUFFL0IsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUU1RCxRQUFBLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRTtBQUNiLFlBQUEsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDbEIsWUFBQSxTQUFTLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQztZQUM5QixTQUFTLEdBQUcsYUFBYSxDQUFDO1NBQzNCO2FBQU0sSUFBSSxZQUFZLEVBQUU7QUFDdkIsWUFBQSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLFlBQVksQ0FBQzs7Ozs7O1lBT3hDLEdBQUcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUV6RCxZQUFBLElBQUksR0FBRyxDQUFDLFNBQVMsRUFBRTtBQUNqQixnQkFBQSxTQUFTLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztnQkFDL0IsU0FBUyxHQUFHLFFBQVEsQ0FBQzthQUN0QjtBQUFNLGlCQUFBLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRTtBQUNwQixnQkFBQSxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztnQkFDM0IsU0FBUyxHQUFHLElBQUksQ0FBQzthQUNsQjtBQUVELFlBQUEsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7U0FDbkI7QUFFRCxRQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDO0tBQ3hDO0FBRUQ7Ozs7OztBQU1HO0lBQ0gsNEJBQTRCLENBQzFCLFlBQTBCLEVBQzFCLEtBQW1CLEVBQUE7UUFFbkIsSUFBSSxhQUFhLEdBQWlCLElBQUksQ0FBQztRQUN2QyxJQUFJLFNBQVMsR0FBaUIsSUFBSSxDQUFDOztBQUduQyxRQUFBLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxPQUFzQixFQUFFLE1BQWMsS0FBSTtBQUNsRSxZQUFBLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUk7QUFDekIsZ0JBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQztBQUNwQixnQkFBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDO0FBQ3RCLGFBQUMsQ0FBQyxDQUFDO0FBQ0wsU0FBQyxDQUFDO0FBRUYsUUFBQSxJQUFJLFlBQVksSUFBSSxLQUFLLEVBQUUsT0FBTyxFQUFFO0FBQ2xDLFlBQUEsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRXZFLFlBQUEsSUFBSSxTQUFTLElBQUksQ0FBQyxFQUFFO0FBQ2xCLGdCQUFBLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsS0FBSyxDQUFDO2dCQUNqQyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEMsZ0JBQUEsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFckQsZ0JBQUEsSUFBSSxlQUFlLElBQUksU0FBUyxFQUFFOzs7b0JBR2hDLGFBQWEsR0FBRyxLQUFLLENBQUM7QUFDdEIsb0JBQUEsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztpQkFDcEQ7QUFBTSxxQkFBQSxJQUFJLGFBQWEsSUFBSSxTQUFTLEVBQUU7O29CQUVyQyxTQUFTLEdBQUcsS0FBSyxDQUFDO2lCQUNuQjtxQkFBTTs7OztBQUlMLG9CQUFBLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7b0JBQ3ZCLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ1YsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLHdCQUFBLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUVqQyx3QkFBQSxJQUFJLGlCQUFpQixJQUFJLFNBQVMsRUFBRTs7QUFFbEMsNEJBQUEsU0FBUyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7QUFFckUsNEJBQUEsYUFBYSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQztBQUN0RSw0QkFBQSxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDOzRCQUNuRCxNQUFNO3lCQUNQO0FBQU0sNkJBQUEsSUFBSSxtQkFBbUIsR0FBRyxTQUFTLEVBQUU7Ozs7NEJBSTFDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDbkQsNEJBQUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxTQUFTLENBQUMsQ0FBQzs0QkFDL0QsU0FBUyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQzs7O0FBSXhDLDRCQUFBLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLDRCQUFBLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQzs0QkFDckMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDbEIsYUFBYSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQzs0QkFDNUMsTUFBTTt5QkFDUDtxQkFDRjtpQkFDRjthQUNGO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLENBQUM7S0FDckM7QUFFRDs7Ozs7Ozs7OztBQVVHO0FBQ0gsSUFBQSxxQkFBcUIsQ0FDbkIsUUFBcUIsRUFDckIsY0FBd0IsRUFDeEIsYUFBcUIsRUFDckIsSUFBVyxFQUNYLFNBQW9CLEVBQ3BCLEtBQW1CLEVBQ25CLHVCQUF1QixHQUFHLElBQUksRUFBQTtRQUU5QixJQUFJLFlBQVksR0FBaUIsSUFBSSxDQUFDO1FBQ3RDLElBQUksU0FBUyxHQUFpQixJQUFJLENBQUM7QUFFbkMsUUFBQSxJQUFJLGFBQWEsRUFBRSxNQUFNLEVBQUU7QUFDekIsWUFBQSxJQUFJLFNBQVMsS0FBSyxTQUFTLENBQUMsT0FBTyxFQUFFO2dCQUNuQyxZQUFZLEdBQUcsS0FBSyxDQUFDO2FBQ3RCO0FBQU0saUJBQUEsSUFBSSxTQUFTLEtBQUssU0FBUyxDQUFDLElBQUksRUFBRTtnQkFDdkMsU0FBUyxHQUFHLEtBQUssQ0FBQzthQUNuQjtTQUNGO2FBQU0sSUFBSSxJQUFJLEVBQUU7QUFDZixZQUFBLGFBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBRTlCLFlBQUEsSUFBSSxTQUFTLEtBQUssU0FBUyxDQUFDLFFBQVEsRUFBRTtnQkFDcEMsWUFBWSxHQUFHLEtBQUssQ0FBQzthQUN0QjtBQUFNLGlCQUFBLElBQUksU0FBUyxLQUFLLFNBQVMsQ0FBQyxJQUFJLEVBQUU7OztBQUd2QyxnQkFBQSxDQUFDLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQzdFLElBQUksRUFDSixLQUFLLENBQ04sRUFBRTthQUNKO1NBQ0Y7QUFFRCxRQUFBLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFFL0QsUUFBQSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDNUUsUUFBQSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNuRjtBQUVEOzs7QUFHRztJQUNILGFBQWEsR0FBQTtRQUNYLE9BQU8sT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ2xEO0FBRUQ7Ozs7QUFJRztJQUNILE9BQU8sYUFBYSxDQUFDLFNBQW9CLEVBQUE7UUFDdkMsTUFBTSxJQUFJLEdBQUcsU0FBUyxFQUFFLG1CQUFtQixDQUFDQyxhQUFJLENBQUMsRUFBRSxJQUFJLENBQUM7UUFDeEQsT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDO0tBQ3JCO0FBRUQ7Ozs7Ozs7QUFPRztBQUNILElBQUEsd0JBQXdCLENBQ3RCLFFBQXFCLEVBQ3JCLElBQW1CLEVBQ25CLG1CQUFtQyxJQUFJLEVBQUE7QUFFdkMsUUFBQSxNQUFNLEVBQUUsMEJBQTBCLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ3JELFFBQUEsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQStDLENBQUM7QUFDN0UsUUFBQSxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRTtBQUM1QixZQUFBLFFBQVEsRUFBRSxTQUFTO0FBQ25CLFlBQUEsYUFBYSxFQUFFLGlCQUFpQjtBQUNoQyxZQUFBLGdCQUFnQixFQUFFLHNCQUFzQjtBQUN6QyxTQUFBLENBQUMsQ0FBQztBQUVILFFBQUEsYUFBYSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNsQyxZQUFBLFFBQVEsRUFBRSxrQkFBa0I7QUFDNUIsWUFBQSxhQUFhLEVBQUUsaUJBQWlCO0FBQ2hDLFlBQUEsZ0JBQWdCLEVBQUUsc0JBQXNCO0FBQ3pDLFNBQUEsQ0FBQyxDQUFDO0FBRUgsUUFBQSxhQUFhLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRTtBQUNoQyxZQUFBLFFBQVEsRUFBRSxpQkFBaUI7QUFDM0IsWUFBQSxhQUFhLEVBQUUscUJBQXFCO0FBQ3BDLFlBQUEsZ0JBQWdCLEVBQUUsMEJBQTBCO0FBQzdDLFNBQUEsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdCQUFnQixFQUFFO0FBQ3JCLFlBQUEsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3hEO1FBRUQsSUFBSSwwQkFBMEIsRUFBRTtBQUM5QixZQUFBLEtBQUssTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDbkQsZ0JBQUEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO0FBQ3hCLG9CQUFBLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0Qix3QkFBQSxRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztxQkFDeEM7QUFFRCxvQkFBQSxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNoRjthQUNGO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sZ0JBQWdCLENBQUM7S0FDekI7QUFFRDs7Ozs7O0FBTUc7QUFDSCxJQUFBLGVBQWUsQ0FDYixnQkFBZ0MsRUFDaEMsZ0JBQTBCLEVBQzFCLFdBQW9CLEVBQ3BCLGFBQXNCLEVBQUE7UUFFdEIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLGdCQUFnQixDQUFDLENBQUM7UUFDdEQsTUFBTSxPQUFPLEdBQUcsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUV0RCxJQUFJLE9BQU8sRUFBRTtZQUNYLElBQUksV0FBVyxFQUFFO0FBQ2YsZ0JBQUEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM3QixnQkFBQUosZ0JBQU8sQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDL0I7WUFFRCxJQUFJLGFBQWEsRUFBRTtBQUNqQixnQkFBQSxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ2hDO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0FBRUQ7Ozs7QUFJRztBQUNILElBQUEsb0JBQW9CLENBQUMsUUFBcUIsRUFBQTtBQUN4QyxRQUFBLE9BQU8sUUFBUSxFQUFFLFNBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNwRTtBQUVEOzs7OztBQUtHO0FBQ0gsSUFBQSxjQUFjLENBQUMsSUFBWSxFQUFBO1FBQ3pCLE9BQU8sY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzdDO0FBRUQ7Ozs7OztBQU1HO0FBQ0gsSUFBQSw2QkFBNkIsQ0FHM0IsSUFBTyxFQUFBO0FBQ1AsUUFBQSxPQUFPLE9BQU8sQ0FBQyw2QkFBNkIsQ0FDMUMsSUFBSSxFQUNKLElBQUksQ0FBQyxRQUFRLEVBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQ3ZCLENBQUM7S0FDSDtBQUVEOzs7Ozs7O0FBT0c7QUFDSCxJQUFBLE9BQU8sNkJBQTZCLENBR2xDLElBQU8sRUFBRSxRQUE4QixFQUFFLGFBQTRCLEVBQUE7QUFDckUsUUFBQSxJQUFJLElBQUksRUFBRSxLQUFLLEVBQUU7WUFDZixNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFFbkMsSUFBSSxJQUFJLElBQUksYUFBYSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7O0FBRW5ELGdCQUFBLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLGdCQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQzthQUN4QjtBQUFNLGlCQUFBLElBQUksUUFBUSxFQUFFLHdCQUF3QixFQUFFLFNBQVMsRUFBRTtBQUN4RCxnQkFBQSxNQUFNLEVBQUUsd0JBQXdCLEVBQUUsR0FBRyxRQUFRLENBQUM7QUFDOUMsZ0JBQUEsTUFBTSxXQUFXLEdBQUcsd0JBQXdCLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztBQUMvRCxnQkFBQSxNQUFNLGtCQUFrQixHQUFHLHdCQUF3QixDQUFDLGtCQUFrQixJQUFJLEVBQUUsQ0FBQztnQkFDN0UsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWYsZ0JBQUEsTUFBTSxTQUFTLEdBQUcsQ0FDaEIsR0FBVyxFQUNYLFVBQThDLEtBQzVDO0FBQ0Ysb0JBQUEsVUFBVSxHQUFHLFVBQVUsSUFBSSxXQUFXLENBQUM7b0JBQ3ZDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztBQUVaLG9CQUFBLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsRUFBRTt3QkFDekQsR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7cUJBQ3RDO0FBRUQsb0JBQUEsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUM5QixpQkFBQyxDQUFDO0FBRUYsZ0JBQUEsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLFVBQTBCLEVBQUUsU0FBa0IsS0FBSTtvQkFDOUUsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBRVosb0JBQUEsSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLElBQUksVUFBVSxLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDbkUsd0JBQUEsR0FBRyxHQUFHLFNBQVMsQ0FBQyxTQUFtQixDQUFDLENBQUM7cUJBQ3RDO0FBRUQsb0JBQUEsT0FBTyxHQUFHLENBQUM7QUFDYixpQkFBQyxDQUFDO2dCQUVGLE1BQU0sSUFBSSxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUN4RSxNQUFNLElBQUksb0JBQW9CLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzVFLGdCQUFBLE1BQU0sSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDakQsZ0JBQUEsTUFBTSxJQUFJLG9CQUFvQixDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDckQsTUFBTSxJQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFFekQsZ0JBQUEsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDN0IsTUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFJLENBQUEsRUFBQSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBRSxDQUFBLENBQUMsQ0FBQztpQkFDN0M7Ozs7QUFLRCxnQkFBQSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDaEMsZ0JBQUEsTUFBTSxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7Ozs7Z0JBTTdCLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDO2FBQy9EO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sSUFBSSxDQUFDO0tBQ2I7QUFFRDs7Ozs7O0FBTUc7QUFDSCxJQUFBLE9BQU8sNEJBQTRCLENBQ2pDLHVCQUF5QyxFQUN6QyxJQUFPLEVBQUE7QUFFUCxRQUFBLElBQUksdUJBQXVCLElBQUksSUFBSSxFQUFFLElBQUksRUFBRTtBQUN6QyxZQUFBLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFFdEIsSUFBSSxDQUFDLGNBQWMsR0FBRyx1QkFBdUIsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLFFBQVEsR0FBRyx1QkFBdUIsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxZQUFZLEdBQUcsdUJBQXVCLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUVyRSxZQUFBLElBQUksQ0FBQyxZQUFZLEdBQUcsdUJBQXVCLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxDQUN2RSxJQUFJLENBQUMsU0FBUyxDQUNmLENBQUM7U0FDSDtBQUVELFFBQUEsT0FBTyxJQUFJLENBQUM7S0FDYjtBQUVEOzs7OztBQUtHO0lBQ0gsNEJBQTRCLENBQUMsUUFBcUIsRUFBRSxRQUFnQixFQUFBO0FBQ2xFLFFBQUEsSUFBSSxDQUFDLCtCQUErQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLFFBQUEsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRS9ELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwRCxPQUFPLEVBQUUsVUFBVSxDQUFDO0FBQ2xCLFlBQUEsR0FBRyxFQUFFLG1CQUFtQjtBQUN4QixZQUFBLElBQUksRUFBRSxpQkFBaUI7QUFDeEIsU0FBQSxDQUFDLENBQUM7QUFFSCxRQUFBLE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0FBRUQ7Ozs7Ozs7QUFPRztJQUNILFVBQVUsQ0FBQyxRQUFnQixFQUFFLEdBQStCLEVBQUE7QUFDMUQsUUFBQSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUMvQixNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQ0ssaUJBQVEsQ0FBQyxDQUFDO1FBQzNELElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUVwQixRQUFBLElBQUksVUFBVSxFQUFFLElBQUksRUFBRTtBQUNwQixZQUFBLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztTQUNuQztRQUVELFNBQVM7QUFDTixhQUFBLFlBQVksQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM3RCxhQUFBLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSTtBQUNiLFlBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM1RCxTQUFDLENBQUMsQ0FBQztLQUNOO0FBQ0Y7O0FDL3BDTSxNQUFNLG1CQUFtQixHQUFHLFlBQVksQ0FBQztBQUUxQyxNQUFPLGdCQUFpQixTQUFRLE9BQTRCLENBQUE7QUFDaEUsSUFBQSxnQkFBZ0IsQ0FBQyxZQUEwQixFQUFBO0FBQ3pDLFFBQUEsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLG9CQUFvQixDQUFDO0tBQzVDO0lBRUQsZUFBZSxDQUNiLFNBQW9CLEVBQ3BCLEtBQWEsRUFDYixVQUFrQixFQUNsQixpQkFBZ0MsRUFDaEMsV0FBMEIsRUFBQTtRQUUxQixNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUV4RCxRQUFBLElBQUksSUFBSSxDQUFDLGtDQUFrQyxFQUFFLEVBQUU7QUFDN0MsWUFBQSxTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7QUFFcEMsWUFBQSxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNsQixZQUFBLEdBQUcsQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0FBQzdCLFlBQUEsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7U0FDeEI7QUFFRCxRQUFBLE9BQU8sR0FBRyxDQUFDO0tBQ1o7QUFFRCxJQUFBLGNBQWMsQ0FBQyxTQUFvQixFQUFBO1FBQ2pDLE1BQU0sV0FBVyxHQUEwQixFQUFFLENBQUM7UUFFOUMsSUFBSSxTQUFTLEVBQUU7WUFDYixTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUM3QixNQUFNLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUM7QUFDM0QsWUFBQSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFFOUIsWUFBQSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFJO2dCQUNyQixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLElBQUksS0FBSyxHQUFpQixJQUFJLENBQUM7Z0JBRS9CLElBQUksYUFBYSxFQUFFO29CQUNqQixLQUFLLEdBQUdGLG9CQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QyxvQkFBQSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztpQkFDdEI7Z0JBRUQsSUFBSSxVQUFVLEVBQUU7QUFDZCxvQkFBQSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7aUJBQ3ZFO0FBQ0gsYUFBQyxDQUFDLENBQUM7WUFFSCxJQUFJLGFBQWEsRUFBRTtnQkFDakJHLDBCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ2hDO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sV0FBVyxDQUFDO0tBQ3BCO0lBRUQsZ0JBQWdCLENBQUMsSUFBeUIsRUFBRSxRQUFxQixFQUFBO1FBQy9ELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLElBQUksRUFBRTtZQUNSLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7QUFDN0UsWUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkQsT0FBTyxHQUFHLElBQUksQ0FBQztTQUNoQjtBQUVELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7SUFFRCxrQkFBa0IsQ0FDaEIsSUFBeUIsRUFDekIsSUFBZ0MsRUFBQTtRQUVoQyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxJQUFJLEVBQUU7QUFDUixZQUFBLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3pCLFlBQUEsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxFQUFFLENBQUM7WUFFakUsSUFBSSxjQUFjLEVBQUU7QUFDbEIsZ0JBQUEsY0FBYyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNsQztZQUVELE9BQU8sR0FBRyxJQUFJLENBQUM7U0FDaEI7QUFFRCxRQUFBLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0lBRVEsdUJBQXVCLENBQzlCLFNBQW9CLEVBQ3BCLElBQWdDLEVBQUE7QUFFaEMsUUFBQSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsa0NBQWtDLEVBQUUsQ0FBQztRQUVqRSxJQUFJLGNBQWMsRUFBRTtBQUNsQixZQUFBLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLFdBQVcsQ0FBQzs7QUFHdkUsWUFBQSxjQUFjLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLFlBQUEsY0FBYyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzFDO0FBRUQsUUFBQSxPQUFPLElBQUksQ0FBQztLQUNiO0lBRU8sUUFBUSxHQUFBO1FBQ2QsTUFBTSxLQUFLLEdBQW9CLEVBQUUsQ0FBQztRQUNsQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsa0NBQWtDLEVBQUUsRUFBRSxVQUFVLENBQUM7UUFFekUsSUFBSSxVQUFVLEVBQUU7WUFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDcEY7UUFFRCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3ZEO0lBRUQsa0NBQWtDLEdBQUE7UUFDaEMsT0FBTyw0QkFBNEIsQ0FDakMsSUFBSSxDQUFDLEdBQUcsRUFDUixtQkFBbUIsQ0FDUSxDQUFDO0tBQy9CO0FBQ0Y7O0FDMUhLLE1BQU8saUJBQWtCLFNBQVEsT0FBbUMsQ0FBQTtBQUN4RSxJQUFBLGdCQUFnQixDQUFDLFlBQTBCLEVBQUE7QUFDekMsUUFBQSxPQUFPLEVBQUUsQ0FBQztLQUNYO0lBRUQsZUFBZSxDQUNiLFVBQXFCLEVBQ3JCLE1BQWMsRUFDZCxXQUFtQixFQUNuQixpQkFBZ0MsRUFDaEMsV0FBMEIsRUFBQTtBQUUxQixRQUFBLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztLQUM1QztBQUVELElBQUEsY0FBYyxDQUFDLFVBQXFCLEVBQUE7QUFDbEMsUUFBQSxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7S0FDNUM7SUFFRCxnQkFBZ0IsQ0FBQyxJQUFnQyxFQUFFLFFBQXFCLEVBQUE7UUFDdEUsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFFBQUEsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMxQixPQUFPLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNyRDthQUFNO1lBQ0wsT0FBTyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDdEQ7QUFFRCxRQUFBLElBQUksSUFBSSxFQUFFLFVBQVUsRUFBRTtBQUNwQixZQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztTQUNyQztBQUVELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7SUFFRCxrQkFBa0IsQ0FDaEIsSUFBZ0MsRUFDaEMsR0FBK0IsRUFBQTtRQUUvQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxJQUFJLEVBQUU7QUFDUixZQUFBLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFFdEIsWUFBQSxJQUFJLENBQUMsd0JBQXdCLENBQzNCLEdBQUcsRUFDSCxJQUFJLEVBQ0osQ0FBQSwwQ0FBQSxFQUE2QyxJQUFJLENBQUMsSUFBSSxDQUFBLENBQUUsQ0FDekQsQ0FBQztZQUVGLE9BQU8sR0FBRyxJQUFJLENBQUM7U0FDaEI7QUFFRCxRQUFBLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0lBRUQsb0JBQW9CLENBQUMsSUFBb0IsRUFBRSxRQUFxQixFQUFBO1FBQzlELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLElBQUksRUFBRTtZQUNSLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQztBQUV4QyxZQUFBLElBQUksQ0FBQyxxQkFBcUIsQ0FDeEIsUUFBUSxFQUNSLENBQUMscUJBQXFCLENBQUMsRUFDdkIsSUFBSSxFQUNKLElBQUksRUFDSixTQUFTLEVBQ1QsS0FBSyxDQUNOLENBQUM7QUFFRixZQUFBLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUMsT0FBTyxHQUFHLElBQUksQ0FBQztTQUNoQjtBQUVELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7SUFFRCxxQkFBcUIsQ0FBQyxJQUFxQixFQUFFLFFBQXFCLEVBQUE7UUFDaEUsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksSUFBSSxFQUFFO1lBQ1IsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBRXhDLElBQUksQ0FBQyxxQkFBcUIsQ0FDeEIsUUFBUSxFQUNSLENBQUMsc0JBQXNCLENBQUMsRUFDeEIsSUFBSSxDQUFDLEtBQUssRUFDVixJQUFJLEVBQ0osU0FBUyxFQUNULEtBQUssRUFDTCxLQUFLLENBQ04sQ0FBQztZQUVGLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUMscUJBQXFCLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2xGLE9BQU8sR0FBRyxJQUFJLENBQUM7U0FDaEI7QUFFRCxRQUFBLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0lBRUQsa0NBQWtDLENBQ2hDLFNBQW9CLEVBQ3BCLElBQWdDLEVBQUE7QUFFaEMsUUFBQSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztBQUM3QixRQUFBLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxPQUFPLENBQUM7QUFDL0IsUUFBQSxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQy9CLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQztRQUVyQixJQUFJLE9BQU8sRUFBRTtBQUNYLFlBQUEsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUMzQixnQkFBQSxTQUFTLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQztBQUM5QixnQkFBQSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzthQUN4QjtpQkFBTTtBQUNMLGdCQUFBLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQzNCLGdCQUFBLFNBQVMsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDO2FBQ3hCO1NBQ0Y7QUFFRCxRQUFBLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzNCLFFBQUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7O1FBRzNCLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxTQUFTLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDL0U7SUFFRCxPQUFPLDBCQUEwQixDQUMvQixRQUFnQixFQUNoQixNQUFnQyxFQUNoQyxRQUE4QixFQUM5QixhQUE0QixFQUFBO0FBRTVCLFFBQUEsTUFBTSxJQUFJLEdBQXlCO1lBQ2pDLFFBQVE7WUFDUixJQUFJLEVBQUUsY0FBYyxDQUFDLFVBQVU7QUFDL0IsWUFBQSxHQUFHLE1BQU07U0FDVixDQUFDO1FBRUYsT0FBTyxPQUFPLENBQUMsNkJBQTZCLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztLQUM3RTtBQUNGOztBQzdJSyxNQUFPLGFBQWMsU0FBUSxPQUF5QixDQUFBO0FBQzFELElBQUEsZ0JBQWdCLENBQUMsWUFBMEIsRUFBQTtBQUN6QyxRQUFBLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQztLQUN6QztJQUVELGVBQWUsQ0FDYixTQUFvQixFQUNwQixLQUFhLEVBQ2IsVUFBa0IsRUFDbEIsaUJBQWdDLEVBQ2hDLFdBQTBCLEVBQUE7QUFFMUIsUUFBQSxTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFakMsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckQsUUFBQSxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNsQixRQUFBLEdBQUcsQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0FBQzdCLFFBQUEsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFFdkIsUUFBQSxPQUFPLEdBQUcsQ0FBQztLQUNaO0FBRUQsSUFBQSxjQUFjLENBQUMsU0FBb0IsRUFBQTtRQUNqQyxNQUFNLFdBQVcsR0FBdUIsRUFBRSxDQUFDO1FBRTNDLElBQUksU0FBUyxFQUFFO1lBQ2IsU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDN0IsTUFBTSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDO0FBQzNELFlBQUEsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBRTlCLFlBQUEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksS0FBSTtBQUNyQixnQkFBQSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztnQkFDN0IsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLGdCQUFBLElBQUksTUFBTSxHQUE2QixFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUVsRixnQkFBQSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQzNDLElBQUksRUFDSixJQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUN0QyxDQUFDO2dCQUVGLElBQUksYUFBYSxFQUFFO29CQUNqQixNQUFNLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3ZFLFVBQVUsR0FBRyxNQUFNLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUM7aUJBQ2xEO2dCQUVELElBQUksVUFBVSxFQUFFO29CQUNkLFdBQVcsQ0FBQyxJQUFJLENBQ2QsSUFBSSxDQUFDLGdCQUFnQixDQUNuQixTQUFTLENBQUMsdUJBQXVCLEVBQ2pDLElBQUksRUFDSixJQUFJLEVBQ0osTUFBTSxFQUNOLGNBQWMsQ0FDZixDQUNGLENBQUM7aUJBQ0g7QUFDSCxhQUFDLENBQUMsQ0FBQztZQUVILElBQUksYUFBYSxFQUFFO2dCQUNqQkEsMEJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDaEM7U0FDRjtBQUVELFFBQUEsT0FBTyxXQUFXLENBQUM7S0FDcEI7SUFFRCxpQkFBaUIsQ0FBQyxJQUFtQixFQUFFLFdBQXdCLEVBQUE7QUFDN0QsUUFBQSxPQUFPLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDbkY7QUFFRCxJQUFBLE9BQU8saUJBQWlCLENBQ3RCLElBQW1CLEVBQ25CLFdBQXdCLEVBQ3hCLGFBQTRCLEVBQUE7QUFFNUIsUUFBQSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFFBQUEsTUFBTSxJQUFJLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQztBQUN4QixRQUFBLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUVqQyxRQUFBLElBQUksV0FBVyxLQUFLLElBQUksSUFBSSxJQUFJLEVBQUU7WUFDaEMsTUFBTSxFQUFFLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFekQsSUFBSSxFQUFFLEVBQUU7QUFDTixnQkFBQSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNoRDtTQUNGO0FBRUQsUUFBQSxPQUFPLElBQUksQ0FBQztLQUNiO0lBRUQsUUFBUSxHQUFBO0FBQ04sUUFBQSxNQUFNLEVBQ0osZ0JBQWdCLEVBQ2hCLHlCQUF5QixFQUN6QiwyQkFBMkIsRUFBRSxpQkFBaUIsR0FDL0MsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBRWxCLFFBQUEsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLHlCQUF5QixFQUFFO1lBQ3JFLGlCQUFpQjtBQUNsQixTQUFBLENBQUMsQ0FBQztLQUNKO0lBRUQsZ0JBQWdCLENBQUMsSUFBc0IsRUFBRSxRQUFxQixFQUFBO1FBQzVELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLElBQUksRUFBRTtZQUNSLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQztBQUN4QyxZQUFBLE1BQU0sWUFBWSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTdFLElBQUksQ0FBQyxxQkFBcUIsQ0FDeEIsUUFBUSxFQUNSLENBQUMsdUJBQXVCLENBQUMsRUFDekIsSUFBSSxDQUFDLGNBQWMsRUFDbkIsSUFBSSxFQUNKLFNBQVMsRUFDVCxLQUFLLEVBQ0wsWUFBWSxDQUNiLENBQUM7QUFFRixZQUFBLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUMsT0FBTyxHQUFHLElBQUksQ0FBQztTQUNoQjtBQUVELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7SUFFRCxrQkFBa0IsQ0FBQyxJQUFzQixFQUFFLEdBQStCLEVBQUE7UUFDeEUsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksSUFBSSxFQUFFO1lBQ1IsSUFBSSxDQUFDLHdCQUF3QixDQUMzQixHQUFHLEVBQ0gsSUFBSSxDQUFDLElBQUksRUFDVCwrQ0FBK0MsRUFDL0MsSUFBSSxFQUNKLElBQUksQ0FBQyxJQUFJLEVBQ1QsSUFBSSxFQUNKLElBQUksQ0FDTCxDQUFDO1lBQ0YsT0FBTyxHQUFHLElBQUksQ0FBQztTQUNoQjtBQUVELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7SUFFRCxnQkFBZ0IsQ0FDZCx1QkFBeUMsRUFDekMsSUFBbUIsRUFDbkIsSUFBVyxFQUNYLE1BQWdDLEVBQ2hDLGNBQXVCLEVBQUE7UUFFdkIsT0FBTyxhQUFhLENBQUMsZ0JBQWdCLENBQ25DLHVCQUF1QixFQUN2QixJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUksQ0FBQyxRQUFRLEVBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQ3RCLGNBQWMsRUFDZCxNQUFNLENBQ1AsQ0FBQztLQUNIO0FBRUQsSUFBQSxPQUFPLGdCQUFnQixDQUNyQix1QkFBeUMsRUFDekMsSUFBbUIsRUFDbkIsSUFBVyxFQUNYLFFBQThCLEVBQzlCLGFBQTRCLEVBQzVCLGNBQXVCLEVBQ3ZCLE1BQWlDLEVBQUE7QUFFakMsUUFBQSxNQUFNLEdBQUcsTUFBTSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDL0UsUUFBQSxjQUFjLEdBQUcsY0FBYyxJQUFJLElBQUksQ0FBQztBQUV4QyxRQUFBLElBQUksSUFBSSxHQUFxQjtBQUMzQixZQUFBLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSTtZQUNKLGNBQWM7WUFDZCxJQUFJLEVBQUUsY0FBYyxDQUFDLFVBQVU7QUFDL0IsWUFBQSxHQUFHLE1BQU07U0FDVixDQUFDO1FBRUYsSUFBSSxHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzRSxPQUFPLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0tBQzdFO0FBQ0Y7O0FDN0tNLE1BQU0sbUJBQW1CLEdBQUcsV0FBVyxDQUFDO0FBRXpDLE1BQU8sZ0JBQWlCLFNBQVEsT0FBNEIsQ0FBQTtBQUNoRSxJQUFBLGdCQUFnQixDQUFDLFlBQTBCLEVBQUE7QUFDekMsUUFBQSxPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsb0JBQW9CLENBQUM7S0FDNUM7SUFFRCxlQUFlLENBQ2IsU0FBb0IsRUFDcEIsS0FBYSxFQUNiLFVBQWtCLEVBQ2xCLGlCQUFnQyxFQUNoQyxXQUEwQixFQUFBO1FBRTFCLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRXhELFFBQUEsSUFBSSxJQUFJLENBQUMsaUNBQWlDLEVBQUUsRUFBRTtBQUM1QyxZQUFBLFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUVwQyxZQUFBLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLFlBQUEsR0FBRyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7QUFDN0IsWUFBQSxHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztTQUN4QjtBQUVELFFBQUEsT0FBTyxHQUFHLENBQUM7S0FDWjtBQUVELElBQUEsY0FBYyxDQUFDLFNBQW9CLEVBQUE7UUFDakMsTUFBTSxXQUFXLEdBQTBCLEVBQUUsQ0FBQztRQUU5QyxJQUFJLFNBQVMsRUFBRTtZQUNiLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzdCLE1BQU0sRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQztZQUMzRCxNQUFNLEVBQUUsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVsRCxZQUFBLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUk7Z0JBQzVCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQztBQUN0QixnQkFBQSxJQUFJLE1BQU0sR0FBNkIsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUM7Z0JBRWxGLElBQUksYUFBYSxFQUFFO29CQUNqQixNQUFNLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3BFLFVBQVUsR0FBRyxNQUFNLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUM7aUJBQ2xEO2dCQUVELElBQUksVUFBVSxFQUFFO0FBQ2Qsb0JBQUEsV0FBVyxDQUFDLElBQUksQ0FDZCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLHVCQUF1QixFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FDdkUsQ0FBQztpQkFDSDtBQUNILGFBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxhQUFhLEVBQUU7Z0JBQ2pCQSwwQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUNoQztTQUNGO0FBRUQsUUFBQSxPQUFPLFdBQVcsQ0FBQztLQUNwQjtJQUVELGdCQUFnQixDQUFDLEtBQTBCLEVBQUUsU0FBc0IsRUFBQTtBQUNqRSxRQUFBLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFFRCxrQkFBa0IsQ0FDaEIsS0FBMEIsRUFDMUIsSUFBZ0MsRUFBQTtBQUVoQyxRQUFBLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7QUFFRCxJQUFBLGlCQUFpQixDQUNmLGNBQXVDLEVBQ3ZDLFFBQTZCLEVBQzdCLElBQVcsRUFDWCxXQUF3QixFQUFBO1FBRXhCLElBQUksSUFBSSxHQUFHLGNBQWMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFakQsUUFBQSxJQUFJLFdBQVcsS0FBSyxJQUFJLElBQUksSUFBSSxFQUFFO1lBQ2hDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFakMsSUFBSSxFQUFFLEVBQUU7Ozs7O2dCQUtOLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDM0M7U0FDRjtBQUVELFFBQUEsT0FBTyxJQUFJLENBQUM7S0FDYjtBQUVELElBQUEsUUFBUSxDQUFDLFNBQTJCLEVBQUE7UUFLbEMsTUFBTSxZQUFZLEdBQXdCLEVBQUUsQ0FBQztBQUM3QyxRQUFBLE1BQU0sYUFBYSxHQUFHLElBQUksR0FBRyxFQUE4QixDQUFDO0FBQzVELFFBQUEsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztBQUN0RCxRQUFBLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDO1FBRWhFLElBQUksY0FBYyxFQUFFOzs7WUFHbEIsTUFBTSxjQUFjLEdBQUcsU0FBUztBQUM5QixrQkFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDO0FBQ25DLGtCQUFFLElBQUksR0FBRyxFQUFVLENBQUM7QUFFdEIsWUFBQSxNQUFNLGlCQUFpQixHQUFHLENBQUMsU0FBZ0MsRUFBRSxJQUFZLEtBQUk7QUFDM0UsZ0JBQUEsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLFFBQVEsS0FBSTtBQUM5QixvQkFBQSxJQUFJLGdCQUFnQixDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ3pELHdCQUFBLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQSxFQUFHLElBQUksQ0FBQSxFQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUEsQ0FBQSxDQUFHLENBQUMsQ0FBQztxQkFDaEU7QUFBTSx5QkFBQSxJQUNMLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUN6RTtBQUNBLHdCQUFBLE1BQU0sWUFBWSxHQUFzQjtBQUN0Qyw0QkFBQSxJQUFJLEVBQUUsUUFBUTtBQUNkLDRCQUFBLFlBQVksRUFBRSxJQUFJO0FBQ2xCLDRCQUFBLElBQUksRUFBRSxJQUFJO3lCQUNYLENBQUM7QUFFRix3QkFBQSxJQUFJLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxFQUFFOzRCQUN4RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFFaEQsSUFBSSxJQUFJLEVBQUU7QUFDUixnQ0FBQSxZQUFZLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQ0FFekIsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDL0MsZ0NBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM1QixnQ0FBQSxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQzs2QkFDbkM7eUJBQ0Y7NkJBQU07QUFDTCw0QkFBQSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7eUJBQ3BDO3dCQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FDbEMsY0FBYyxFQUNkLFFBQVEsRUFDUixZQUFZLENBQUMsSUFBSSxFQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUN0QyxDQUFDO0FBRUYsd0JBQUEsWUFBWSxDQUFDLFlBQVksR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQ3pDLHdCQUFBLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7cUJBQ2pDO0FBQ0gsaUJBQUMsQ0FBQyxDQUFDO0FBQ0wsYUFBQyxDQUFDO0FBRUYsWUFBQSxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzdDO0FBRUQsUUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDO0tBQzFEO0lBRUQsaUNBQWlDLEdBQUE7UUFDL0IsT0FBTyw0QkFBNEIsQ0FDakMsSUFBSSxDQUFDLEdBQUcsRUFDUixtQkFBbUIsQ0FDTyxDQUFDO0tBQzlCO0FBRUQsSUFBQSxnQkFBZ0IsQ0FDZCx1QkFBeUMsRUFDekMsWUFBK0IsRUFDL0IsTUFBZ0MsRUFBQTtRQUVoQyxPQUFPLGdCQUFnQixDQUFDLGdCQUFnQixDQUN0Qyx1QkFBdUIsRUFDdkIsWUFBWSxFQUNaLElBQUksQ0FBQyxRQUFRLEVBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQ3RCLE1BQU0sQ0FDUCxDQUFDO0tBQ0g7SUFFRCxPQUFPLGdCQUFnQixDQUNyQix1QkFBeUMsRUFDekMsWUFBK0IsRUFDL0IsUUFBOEIsRUFDOUIsYUFBNEIsRUFDNUIsTUFBZ0MsRUFBQTtBQUVoQyxRQUFBLElBQUksSUFBSSxHQUF3QjtZQUM5QixJQUFJLEVBQUUsY0FBYyxDQUFDLFFBQVE7WUFDN0IsSUFBSSxFQUFFLFlBQVksQ0FBQyxJQUFJO1lBQ3ZCLFlBQVksRUFBRSxZQUFZLENBQUMsWUFBWTtZQUN2QyxJQUFJLEVBQUUsWUFBWSxDQUFDLElBQUk7QUFDdkIsWUFBQSxHQUFHLE1BQU07U0FDVixDQUFDO1FBRUYsSUFBSSxHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzRSxPQUFPLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0tBQzdFO0lBRUQsT0FBTyx5QkFBeUIsQ0FBQyxHQUFZLEVBQUE7UUFDM0MsT0FBTyxRQUFRLENBQTBCLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDL0Q7SUFFRCxPQUFPLDBCQUEwQixDQUFDLEdBQVksRUFBQTtRQUM1QyxPQUFPLFFBQVEsQ0FBMEIsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNoRTtBQUNGOztBQ3pMSyxNQUFPLGVBQWdCLFNBQVEsT0FBaUMsQ0FBQTtBQUNwRSxJQUFBLGdCQUFnQixDQUFDLFlBQTBCLEVBQUE7QUFDekMsUUFBQSxPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsbUJBQW1CLENBQUM7S0FDM0M7SUFFRCxlQUFlLENBQ2IsU0FBb0IsRUFDcEIsS0FBYSxFQUNiLFVBQWtCLEVBQ2xCLGlCQUFnQyxFQUNoQyxXQUEwQixFQUFBO0FBRTFCLFFBQUEsU0FBUyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBRW5DLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3ZELFFBQUEsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbEIsUUFBQSxHQUFHLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUM3QixRQUFBLEdBQUcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBRXZCLFFBQUEsT0FBTyxHQUFHLENBQUM7S0FDWjtJQUVELGtCQUFrQixDQUFDLElBQXVCLEVBQUUsR0FBK0IsRUFBQTtRQUN6RSxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxJQUFJLEVBQUU7QUFDUixZQUFBLE1BQU0sRUFDSixLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQ3BCLEdBQUcsRUFBRSxNQUFNLEdBQ1osR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQzs7QUFHdkIsWUFBQSxNQUFNLE1BQU0sR0FBRztBQUNiLGdCQUFBLE1BQU0sRUFBRSxJQUFJO0FBQ1osZ0JBQUEsS0FBSyxFQUFFLElBQUk7QUFDWCxnQkFBQSxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFO2dCQUN2QixNQUFNO2dCQUNOLElBQUk7QUFDSixnQkFBQSxNQUFNLEVBQUU7QUFDTixvQkFBQSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRTtBQUN2QixvQkFBQSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRTtBQUN0QixpQkFBQTthQUNGLENBQUM7QUFFRixZQUFBLElBQUksQ0FBQyx3QkFBd0IsQ0FDM0IsR0FBRyxFQUNILElBQUksQ0FBQyxJQUFJLEVBQ1QseUNBQXlDLEVBQ3pDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FDekIsQ0FBQztZQUVGLE9BQU8sR0FBRyxJQUFJLENBQUM7U0FDaEI7QUFFRCxRQUFBLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0lBRUQsZ0JBQWdCLENBQUMsSUFBdUIsRUFBRSxRQUFxQixFQUFBO1FBQzdELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLElBQUksRUFBRTtBQUNSLFlBQUEsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztBQUV0QixZQUFBLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxRQUFRLEVBQUU7Z0JBQzdDLHlCQUF5QjtnQkFDekIsQ0FBaUIsY0FBQSxFQUFBLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FBQTtBQUM5QixhQUFBLENBQUMsQ0FBQztBQUVILFlBQUEsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztZQUd0QyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsd0JBQXdCLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2hFLFlBQUEsSUFBSSxDQUFDLGVBQWUsQ0FDbEIsZ0JBQWdCLEVBQ2hCLENBQUMsd0JBQXdCLENBQUMsRUFDMUIsSUFBSSxFQUNKLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FDOUIsQ0FBQztBQUVGLFlBQUEsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ25CLGdCQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzthQUNyQztZQUVELE9BQU8sR0FBRyxJQUFJLENBQUM7U0FDaEI7QUFFRCxRQUFBLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0FBRUQsSUFBQSxrQkFBa0IsQ0FBQyxTQUFvQixFQUFBO1FBQ3JDLE1BQU0sRUFDSixRQUFRLEVBQUUsRUFDUixvQkFBb0IsRUFDcEIscUJBQXFCLEVBQ3JCLHFCQUFxQixFQUNyQix1QkFBdUIsRUFDdkIsb0JBQW9CLEVBQUUsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsR0FDNUQsR0FDRixHQUFHLElBQUksQ0FBQztBQUVULFFBQUEsTUFBTSxvQkFBb0IsR0FBRyxlQUFlLElBQUksZ0JBQWdCLENBQUM7O0FBR2pFLFFBQUEsTUFBTSx1QkFBdUIsR0FBbUQ7QUFDOUUsWUFBQSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsR0FBRyx1QkFBdUI7QUFDM0QsWUFBQSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsR0FBRyxxQkFBcUI7QUFDdkQsWUFBQSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsR0FBRyxxQkFBcUI7QUFDdkQsWUFBQSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsR0FBRyxvQkFBb0I7QUFDckQsWUFBQSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsR0FBRyxvQkFBb0I7U0FDM0QsQ0FBQztBQUVGLFFBQUEsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEtBQUk7OztBQUdyRCxZQUFBLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDM0UsS0FBSyxDQUFDLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsRUFBMEIsQ0FBQyxDQUFDO2FBQy9FO1lBRUQsT0FBTyxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQzNCLFNBQUMsQ0FBQyxDQUFDO0tBQ0o7QUFFRCxJQUFBLGNBQWMsQ0FBQyxTQUFvQixFQUFBO1FBQ2pDLElBQUksV0FBVyxHQUErQixFQUFFLENBQUM7UUFFakQsSUFBSSxTQUFTLEVBQUU7WUFDYixTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUM3QixZQUFBLE1BQU0sRUFBRSxhQUFhLEVBQUUsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDO0FBQ2hELFlBQUEsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztZQUMxQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDekQsWUFBQSxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztBQUU5QyxZQUFBLElBQUksYUFBYSxJQUFJLGVBQWUsRUFBRTtBQUNwQyxnQkFBQSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsUUFBUSxDQUFDO2dCQUMzQixNQUFNLEVBQ0osR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQ2YsR0FBRyxJQUFJLENBQUM7O0FBR1QsZ0JBQUEsTUFBTSxPQUFPLEdBQUc7b0JBQ2QsUUFBUSxFQUFFLFFBQVEsQ0FBQyxvQkFBb0I7b0JBQ3ZDLFdBQVcsRUFBRSxRQUFRLENBQUMsaUJBQWlCO29CQUN2QyxPQUFPLEVBQUUsUUFBUSxDQUFDLGVBQWU7b0JBQ2pDLFNBQVMsRUFBRSxRQUFRLENBQUMscUJBQXFCO29CQUN6QyxRQUFRLEVBQUUsUUFBUSxDQUFDLHFCQUFxQjtBQUN4QyxvQkFBQSxrQkFBa0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0I7QUFDaEQsb0JBQUEsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLGdCQUFnQjtpQkFDdkMsQ0FBQztBQUVGLGdCQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDbEZBLDBCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUUvQixJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxLQUFLLEVBQUU7b0JBQzNDLFdBQVcsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDM0M7YUFDRjtpQkFBTTtnQkFDTCxJQUFJLENBQUMsc0NBQXNDLENBQ3pDLFNBQVMsRUFDVCxXQUF3RSxFQUN4RSxJQUFJLEdBQUcsRUFBVSxFQUNqQixFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxDQUNqRSxDQUFDO2FBQ0g7U0FDRjtBQUVELFFBQUEsT0FBTyxXQUFXLENBQUM7S0FDcEI7SUFFRCxRQUFRLENBQ04sS0FBc0IsRUFDdEIsU0FBb0IsRUFDcEIsVUFBc0MsRUFDdEMsY0FBMkIsRUFDM0IsT0FRQyxFQUFBO0FBRUQsUUFBQSxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQzs7O1FBSTlDLE1BQU0sc0JBQXNCLEdBQUcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUN0RSxJQUFJLENBQUMsc0NBQXNDLENBQ3pDLFNBQVMsRUFDVCxVQUF1RSxFQUN2RSxjQUFjLEVBQ2Qsc0JBQXNCLENBQ3ZCLENBQUM7O0FBR0YsUUFBQSxNQUFNLGVBQWUsR0FBRztZQUN0QixhQUFhLEVBQUUsT0FBTyxDQUFDLFNBQVM7WUFDaEMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFNBQVM7U0FDcEMsQ0FBQztRQUNGLElBQUksQ0FBQywwQkFBMEIsQ0FDN0IsU0FBUyxFQUNULFVBQVUsRUFDVixjQUFjLEVBQ2QsZUFBZSxDQUNoQixDQUFDOztBQUdGLFFBQUEsTUFBTSxXQUFXLEdBQUc7WUFDbEIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1lBQzFCLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVztZQUNoQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87WUFDeEIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1lBQzFCLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxrQkFBa0I7U0FDL0MsQ0FBQztBQUNGLFFBQUEsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQzs7O0FBSXRGLFFBQUEsSUFBSSxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQzFDLElBQUksQ0FBQyx3QkFBd0IsQ0FDM0IsVUFBb0MsRUFDcEMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQ2hDLENBQUM7U0FDSDtLQUNGO0FBRUQsSUFBQSwwQkFBMEIsQ0FDeEIsU0FBb0IsRUFDcEIsVUFBc0MsRUFDdEMsY0FBMkIsRUFDM0IsT0FHQyxFQUFBO0FBRUQsUUFBQSxNQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDO0FBQzVDLFFBQUEsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUM7UUFDNUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQztRQUU5RSxJQUFJLGVBQWUsRUFBRTtZQUNuQixNQUFNLHNCQUFzQixHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFbEYsWUFBQSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7QUFDL0IsZ0JBQUEsYUFBYSxFQUFFLHNCQUFzQjtBQUNyQyxnQkFBQSxnQkFBZ0IsRUFBRSxzQkFBc0I7QUFDekMsYUFBQSxDQUFDLENBQUM7U0FDSjtBQUVELFFBQUEsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLGdCQUE2QyxLQUFJO0FBQ3pFLFlBQUEsS0FBSyxNQUFNLFlBQVksSUFBSSxnQkFBZ0IsRUFBRTtnQkFDM0MsSUFBSSxDQUFDLHFCQUFxQixDQUN4QixTQUFTLEVBQ1QsVUFBbUMsRUFDbkMsU0FBUyxFQUNULFlBQVksQ0FDYixDQUFDO2FBQ0g7QUFDSCxTQUFDLENBQUM7QUFFRixRQUFBLElBQUksT0FBTyxDQUFDLGFBQWEsRUFBRTtBQUN6QixZQUFBLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0IsS0FBSTtnQkFDekMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNyQyxhQUFDLENBQUMsQ0FBQztTQUNKO0FBRUQsUUFBQSxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtZQUM1QixnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1NBQ3BDO0tBQ0Y7SUFFRCxxQkFBcUIsQ0FDbkIsU0FBb0IsRUFDcEIsS0FBc0IsRUFDdEIsVUFBc0MsRUFDdEMsY0FBMkIsRUFDM0IsT0FNQyxFQUFBO0FBRUQsUUFBQSxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztRQUU5QyxJQUFJLGVBQWUsRUFBRTtBQUNuQixZQUFBLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FDMUMsY0FBYyxFQUNkLG9CQUFvQixDQUFDLFFBQVEsQ0FDOUIsQ0FBQztBQUVGLFlBQUEsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUMvQyxjQUFjLEVBQ2Qsb0JBQW9CLENBQUMsYUFBYSxDQUNuQyxDQUFDOzs7WUFJRixNQUFNLGlCQUFpQixHQUNyQixzQkFBc0I7Z0JBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXJFLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztZQUN4QixJQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQztZQUUvQixJQUFJLGlCQUFpQixFQUFFO0FBQ3JCLGdCQUFBLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQztBQUMzQyxnQkFBQSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsa0JBQWtCLEtBQUssSUFBSSxDQUFDO2FBQzFEO0FBRUQsWUFBQSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7QUFDL0IsZ0JBQUEsUUFBUSxFQUFFLGlCQUFpQjtBQUMzQixnQkFBQSxPQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFBLFFBQVEsRUFBRSxpQkFBaUI7Z0JBQzNCLFdBQVc7Z0JBQ1gsa0JBQWtCO0FBQ25CLGFBQUEsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtBQUNMLFlBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQ3JCO0FBQ0UsZ0JBQUEsUUFBUSxFQUFFLElBQUk7QUFDZCxnQkFBQSxXQUFXLEVBQUUsSUFBSTtBQUNqQixnQkFBQSxPQUFPLEVBQUUsSUFBSTtBQUNiLGdCQUFBLFFBQVEsRUFBRSxJQUFJO0FBQ2QsZ0JBQUEsa0JBQWtCLEVBQUUsSUFBSTthQUN6QixFQUNELE9BQU8sQ0FDUixDQUFDO1NBQ0g7O1FBR0QsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUNuRixDQUFDLE1BQU0sS0FBSyxNQUFNLEtBQUssSUFBSSxDQUM1QixDQUFDO1FBRUYsSUFBSSxrQkFBa0IsRUFBRTtBQUN0QixZQUFBLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDO0FBQzVDLFlBQUEsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDekMsWUFBQSxNQUFNLGdCQUFnQixHQUFHLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQy9ELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBb0IsQ0FBQztBQUU3RCxZQUFBLE9BQU8sS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDdkIsZ0JBQUEsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRXpCLGdCQUFBLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNqQixJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLEVBQUU7QUFDaEQsd0JBQUEsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztxQkFDN0U7aUJBQ0Y7cUJBQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDdkMsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUUsSUFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDbEQ7YUFDRjtTQUNGO0tBQ0Y7SUFFRCxxQkFBcUIsQ0FDbkIsU0FBb0IsRUFDcEIsV0FBdUMsRUFDdkMsSUFBVyxFQUNYLFNBQXdCLEVBQ3hCLE9BTUMsRUFBQTtRQUVELElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztBQUV4QixRQUFBLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtBQUNwQixZQUFBLFdBQVcsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQ3RDLFNBQVMsRUFDVCxXQUFrQyxFQUNsQyxTQUFTLEVBQ1QsSUFBSSxFQUNKLE9BQU8sQ0FBQyxXQUFXLENBQ3BCLENBQUM7U0FDSDtBQUVELFFBQUEsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1lBQ3BFLElBQUksQ0FBQyxrQkFBa0IsQ0FDckIsU0FBUyxFQUNULFdBQStCLEVBQy9CLFNBQVMsRUFDVCxJQUFJLENBQ0wsQ0FBQztTQUNIO0FBRUQsUUFBQSxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDbkIsSUFBSSxDQUFDLG1CQUFtQixDQUN0QixTQUFTLEVBQ1QsV0FBZ0MsRUFDaEMsU0FBUyxFQUNULElBQUksQ0FDTCxDQUFDO1NBQ0g7S0FDRjtBQUVELElBQUEsaUJBQWlCLENBQUMsSUFBVyxFQUFFLGNBQWlCLEdBQUEsSUFBSSxHQUFHLEVBQVUsRUFBQTtRQUMvRCxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFFdkIsSUFBSSxJQUFJLEVBQUU7WUFDUixNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDckQsWUFBQSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBRTNCLE1BQU0sRUFDSixHQUFHLEVBQUUsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLEVBQ3BDLFFBQVEsRUFBRSxFQUNSLDJCQUEyQixFQUMzQixnQkFBZ0IsRUFDaEIsb0JBQW9CLEVBQUUsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsR0FDNUQsR0FDRixHQUFHLElBQUksQ0FBQztBQUVULFlBQUEsTUFBTSxhQUFhLEdBQ2pCLDJCQUEyQixJQUFJLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXhFLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ2xCLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsRUFBRTtBQUMxRCxvQkFBQSxNQUFNLG9CQUFvQixHQUFHLGVBQWUsSUFBSSxnQkFBZ0IsQ0FBQztvQkFDakUsVUFBVSxHQUFHLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLG9CQUFvQixDQUFDO2lCQUN6RTtxQkFBTTtBQUNMLG9CQUFBLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FDakQsSUFBSSxFQUNKLFlBQVksRUFDWixlQUFlLEVBQ2YsZ0JBQWdCLEVBQ2hCLGdCQUFnQixDQUNqQixDQUFDO29CQUVGLFVBQVUsR0FBRyxZQUFZLElBQUksa0JBQWtCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUNoRTthQUNGO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sVUFBVSxDQUFDO0tBQ25CO0lBRUQseUJBQXlCLENBQ3ZCLElBQVcsRUFDWCxZQUEwQixFQUMxQixlQUF3QixFQUN4QixnQkFBeUIsRUFDekIsZ0JBQTBCLEVBQUE7QUFFMUIsUUFBQSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBRTNCLFFBQUEsSUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQztBQUMzRCxjQUFFLGVBQWU7Y0FDZixnQkFBZ0IsQ0FBQztRQUVyQixJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2QsWUFBQSxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzVDLFlBQUEsU0FBUyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdEM7QUFFRCxRQUFBLE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0FBRUQsSUFBQSxtQkFBbUIsQ0FDakIsU0FBb0IsRUFDcEIsV0FBOEIsRUFDOUIsU0FBd0IsRUFDeEIsSUFBVyxFQUFBO0FBRVgsUUFBQSxNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNuQyxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQztRQUVsRSxJQUFJLFdBQVcsRUFBRTtZQUNmLE1BQU0sT0FBTyxHQUFHLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMxRCxZQUFBLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7O1lBR3ZCLE9BQU8sQ0FBQyxFQUFFLEVBQUU7QUFDVixnQkFBQSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekIsZ0JBQUEsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRWpFLElBQUksS0FBSyxFQUFFO0FBQ1Qsb0JBQUEsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDN0U7YUFDRjtTQUNGO0tBQ0Y7QUFFRCxJQUFBLGtCQUFrQixDQUNoQixTQUFvQixFQUNwQixXQUE2QixFQUM3QixTQUF3QixFQUN4QixJQUFXLEVBQUE7QUFFWCxRQUFBLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FDbEUsU0FBUyxFQUNULElBQUksRUFDSixJQUFJLENBQ0wsQ0FBQztRQUVGLElBQUksS0FBSyxFQUFFO0FBQ1QsWUFBQSxXQUFXLENBQUMsSUFBSSxDQUNkLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQ3hFLENBQUM7U0FDSDtLQUNGO0FBRUQsSUFBQSxxQkFBcUIsQ0FDbkIsU0FBb0IsRUFDcEIsV0FBa0MsRUFDbEMsU0FBd0IsRUFDeEIsWUFBK0IsRUFBQTtBQUUvQixRQUFBLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRWxGLFFBQUEsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLGdCQUFnQixDQUM1QyxTQUFTLENBQUMsdUJBQXVCLEVBQ2pDLFlBQVksRUFDWixJQUFJLENBQUMsUUFBUSxFQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUN0QixNQUFNLENBQ1AsQ0FBQztBQUVGLFlBQUEsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtLQUNGO0lBRUQscUJBQXFCLENBQ25CLFNBQW9CLEVBQ3BCLFdBQWdDLEVBQ2hDLFNBQXdCLEVBQ3hCLElBQVcsRUFDWCxXQUFvQixFQUFBO0FBRXBCLFFBQUEsTUFBTSxFQUFFLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDbkMsUUFBQSxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsSUFBSSxFQUFFLENBQUM7UUFDckUsSUFBSSxFQUFFLEdBQWlCLElBQUksQ0FBQztRQUM1QixJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDeEIsUUFBQSxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO1FBRTNCLE9BQU8sQ0FBQyxFQUFFLEVBQUU7QUFDVixZQUFBLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFFdEIsSUFBSSxXQUFXLEVBQUU7QUFDZixnQkFBQSxTQUFTLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUNsQyxTQUFTLEVBQ1QsV0FBVyxFQUNYLFNBQVMsRUFDVCxJQUFJLEVBQ0osT0FBTyxDQUNSLENBQUM7YUFDSDtBQUVELFlBQUEsSUFBSSxPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtnQkFDdkIsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO0FBRXhDLGdCQUFBLElBQUksRUFBRSxLQUFLLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO29CQUNoRCxFQUFFLEdBQUcsT0FBTyxDQUFDO29CQUNiLFdBQVcsR0FBRyxTQUFTLENBQUM7aUJBQ3pCO2FBQ0Y7U0FDRjtBQUVELFFBQUEsSUFBSSxDQUFDLFdBQVcsSUFBSSxFQUFFLEVBQUU7QUFDdEIsWUFBQSxXQUFXLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNyRjtBQUVELFFBQUEsT0FBTyxXQUFXLENBQUM7S0FDcEI7SUFFRCxtQkFBbUIsQ0FDakIsU0FBb0IsRUFDcEIsV0FBZ0MsRUFDaEMsU0FBd0IsRUFDeEIsSUFBVyxFQUNYLE9BQXFCLEVBQUE7QUFFckIsUUFBQSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFM0UsSUFBSSxLQUFLLEVBQUU7QUFDVCxZQUFBLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDakY7UUFFRCxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7S0FDaEI7SUFFRCx3QkFBd0IsQ0FDdEIsV0FBbUMsRUFDbkMsU0FBd0IsRUFBQTtBQUV4QixRQUFBLE1BQU0sRUFBRSxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ25DLFFBQUEsTUFBTSxFQUFFLGVBQWUsRUFBRSxHQUFHLGFBQWEsQ0FBQztBQUUxQyxRQUFBLE1BQU0sYUFBYSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDeEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM3QyxRQUFBLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7O1FBR3ZCLE9BQU8sQ0FBQyxFQUFFLEVBQUU7OztBQUdWLFlBQUEsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFDdkQsWUFBQSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBRXJCLE9BQU8sQ0FBQyxFQUFFLEVBQUU7O2dCQUVWLGFBQWEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDN0I7U0FDRjtRQUVELE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDakQsUUFBQSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQzs7UUFHMUIsT0FBTyxDQUFDLEVBQUUsRUFBRTtBQUNWLFlBQUEsTUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFbkUsSUFBSSxNQUFNLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FBQyxJQUFJLEVBQUU7QUFDdkMsZ0JBQUEsV0FBVyxDQUFDLElBQUksQ0FDZCxpQkFBaUIsQ0FBQywwQkFBMEIsQ0FDMUMsVUFBVSxFQUNWLE1BQU0sRUFDTixJQUFJLENBQUMsUUFBUSxFQUNiLGFBQWEsQ0FDZCxDQUNGLENBQUM7YUFDSDtTQUNGO0tBQ0Y7QUFFRCxJQUFBLHFCQUFxQixDQUNuQixTQUFvQixFQUNwQixLQUFhLEVBQ2IsSUFBVyxFQUNYLEtBQW1CLEVBQUE7QUFFbkIsUUFBQSxJQUFJLElBQUksR0FBb0I7WUFDMUIsS0FBSztZQUNMLElBQUk7WUFDSixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUM7WUFDMUQsSUFBSSxFQUFFLGNBQWMsQ0FBQyxLQUFLO1NBQzNCLENBQUM7UUFFRixJQUFJLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyRixRQUFBLE9BQU8sSUFBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2pEO0lBRUQsb0JBQW9CLENBQ2xCLFNBQW9CLEVBQ3BCLElBQVcsRUFDWCxLQUFtQixFQUNuQixTQUFvQixFQUNwQixTQUFpQixFQUFBO0FBRWpCLFFBQUEsSUFBSSxJQUFJLEdBQW1CO1lBQ3pCLElBQUk7WUFDSixLQUFLO1lBQ0wsU0FBUztZQUNULFNBQVM7WUFDVCxJQUFJLEVBQUUsY0FBYyxDQUFDLElBQUk7U0FDMUIsQ0FBQztRQUVGLElBQUksR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsU0FBUyxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JGLFFBQUEsT0FBTyxJQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDakQ7QUFFRCxJQUFBLHVCQUF1QixDQUNyQixTQUFvQixFQUNwQixJQUFrQixFQUNsQixJQUFXLEVBQ1gsS0FBbUIsRUFBQTtBQUVuQixRQUFBLElBQUksSUFBSSxHQUFzQjtZQUM1QixJQUFJO1lBQ0osSUFBSTtBQUNKLFlBQUEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNqRSxJQUFJLEVBQUUsY0FBYyxDQUFDLFlBQVk7U0FDbEMsQ0FBQztRQUVGLElBQUksR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsU0FBUyxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JGLFFBQUEsT0FBTyxJQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDakQ7QUFFRCxJQUFBLGlCQUFpQixDQUNmLEtBQW1CLEVBQ25CLElBQWUsRUFDZixJQUFZLEVBQUE7QUFFWixRQUFBLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7UUFDL0IsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBRXJCLElBQUksS0FBSyxFQUFFO1lBQ1QsU0FBUyxHQUFHLElBQUksQ0FBQztZQUNqQixTQUFTLEdBQUcsSUFBSSxDQUFDO1NBQ2xCO1FBRUQsT0FBTztZQUNMLEtBQUs7WUFDTCxTQUFTO1lBQ1QsU0FBUztTQUNWLENBQUM7S0FDSDtBQUVELElBQUEseUJBQXlCLENBQ3ZCLElBQVcsRUFDWCxTQUFvQixFQUNwQixTQUF3QixFQUN4QixVQUFrRCxFQUFBO1FBRWxELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUNsRSxTQUFTLEVBQ1QsRUFBRSxFQUFFLE9BQU8sRUFDWCxJQUFJLENBQ0wsQ0FBQztRQUVGLElBQUksS0FBSyxFQUFFO0FBQ1QsWUFBQSxJQUFJLElBQXdDLENBQUM7QUFFN0MsWUFBQSxJQUFJLFNBQVMsS0FBSyxTQUFTLENBQUMsT0FBTyxFQUFFO0FBQ25DLGdCQUFBLElBQUksR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDakU7aUJBQU07QUFDTCxnQkFBQSxJQUFJLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQzthQUNoRjtBQUVELFlBQUEsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtLQUNGO0FBRUQsSUFBQSx3QkFBd0IsQ0FDdEIsSUFBbUIsRUFDbkIsU0FBb0IsRUFDcEIsU0FBd0IsRUFDeEIsVUFBOEIsRUFBQTtBQUU5QixRQUFBLE1BQU0sSUFBSSxHQUFHLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1FBQzlCLE1BQU0sRUFDSixRQUFRLEVBQ1IsR0FBRyxFQUFFLEVBQUUsYUFBYSxFQUFFLEdBQ3ZCLEdBQUcsSUFBSSxDQUFDO0FBRVQsUUFBQSxNQUFNLGNBQWMsR0FBRyxhQUFhLENBQUMsaUJBQWlCLENBQ3BELElBQUksRUFDSixRQUFRLENBQUMsdUJBQXVCLEVBQ2hDLGFBQWEsQ0FDZCxDQUFDO0FBRUYsUUFBQSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUU3RSxRQUFBLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNoQixNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQ3pDLFNBQVMsQ0FBQyx1QkFBdUIsRUFDakMsSUFBSSxFQUNKLElBQUksRUFDSixRQUFRLEVBQ1IsYUFBYSxFQUNiLGNBQWMsRUFDZCxNQUFNLENBQ1AsQ0FBQztBQUVGLFlBQUEsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtLQUNGO0FBRUQsSUFBQSxzQ0FBc0MsQ0FDcEMsU0FBb0IsRUFDcEIsVUFBcUUsRUFDckUsY0FBMkIsRUFDM0IsT0FHQyxFQUFBO0FBRUQsUUFBQSxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQztRQUVuRCxJQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLEVBQUU7QUFDeEQsWUFBQSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ3pFO2FBQU07QUFDTCxZQUFBLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDeEU7QUFFRCxRQUFBLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtBQUNuQixZQUFBLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyx1QkFBdUIsRUFBRSxtQkFBbUIsQ0FBQztBQUV0RSxZQUFBLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUk7Z0JBQ3ZCLElBQUksQ0FBQyx3QkFBd0IsQ0FDM0IsSUFBSSxFQUNKLFNBQVMsRUFDVCxTQUFTLEVBQ1QsVUFBZ0MsQ0FDakMsQ0FBQztBQUNKLGFBQUMsQ0FBQyxDQUFDO1NBQ0o7QUFFRCxRQUFBLElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRTtBQUN2QixZQUFBLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyx1QkFBdUIsRUFBRSxlQUFlLENBQUM7QUFFakUsWUFBQSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFJO2dCQUN0QixJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLEVBQUU7b0JBQ2hELElBQUksQ0FBQyx5QkFBeUIsQ0FDNUIsSUFBSSxFQUNKLFNBQVMsRUFDVCxTQUFTLEVBQ1QsVUFBb0QsQ0FDckQsQ0FBQztpQkFDSDtBQUNILGFBQUMsQ0FBQyxDQUFDO1NBQ0o7S0FDRjtJQUVRLHVCQUF1QixDQUM5QixTQUFvQixFQUNwQixHQUErQixFQUFBO0FBRS9CLFFBQUEsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsV0FBVyxDQUFDO0FBQ3pFLFFBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDL0IsUUFBQSxPQUFPLElBQUksQ0FBQztLQUNiO0FBQ0Y7O0FDanpCRCxNQUFNLGVBQWUsR0FBMkI7QUFDOUMsSUFBQSxJQUFJLEVBQUUsa0JBQWtCO0FBQ3hCLElBQUEsSUFBSSxFQUFFLG9CQUFvQjtBQUMxQixJQUFBLElBQUksRUFBRSxjQUFjO0FBQ3BCLElBQUEsS0FBSyxFQUFFLGNBQWM7Q0FDdEIsQ0FBQztBQUVJLE1BQU8sYUFBYyxTQUFRLE9BQXlCLENBQUE7QUFHMUQsSUFBQSxnQkFBZ0IsQ0FBQyxXQUF5QixFQUFBO0FBQ3hDLFFBQUEsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztRQUMxQixPQUFPLFdBQVcsRUFBRSx1QkFBdUI7Y0FDdkMsUUFBUSxDQUFDLDZCQUE2QjtBQUN4QyxjQUFFLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztLQUNoQztJQUVELGVBQWUsQ0FDYixTQUFvQixFQUNwQixLQUFhLEVBQ2IsVUFBa0IsRUFDbEIsZ0JBQStCLEVBQy9CLFVBQXlCLEVBQUE7UUFFekIsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUF5QixDQUFDO0FBQzdFLFFBQUEsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLCtCQUErQixDQUNyRCxnQkFBZ0IsRUFDaEIsVUFBVSxFQUNWLEtBQUssS0FBSyxDQUFDLEVBQ1gsU0FBUyxDQUFDLFdBQVcsQ0FDdEIsQ0FBQztRQUVGLElBQUksVUFBVSxFQUFFO0FBQ2QsWUFBQSxTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFFakMsWUFBQSxHQUFHLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQztBQUN4QixZQUFBLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLFlBQUEsR0FBRyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7QUFDN0IsWUFBQSxHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztTQUN4QjtBQUVELFFBQUEsT0FBTyxHQUFHLENBQUM7S0FDWjtJQUVRLE1BQU0sY0FBYyxDQUFDLFNBQW9CLEVBQUE7UUFDaEQsTUFBTSxXQUFXLEdBQXVCLEVBQUUsQ0FBQztRQUUzQyxJQUFJLFNBQVMsRUFBRTtBQUNiLFlBQUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFFM0IsU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDN0IsTUFBTSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDO1lBQzNELE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBeUIsQ0FBQztBQUNuRixZQUFBLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBRW5FLFlBQUEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksS0FBSTtnQkFDckIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixJQUFJLEtBQUssR0FBaUIsSUFBSSxDQUFDO2dCQUUvQixJQUFJLGFBQWEsRUFBRTtBQUNqQixvQkFBQSxLQUFLLEdBQUdILG9CQUFXLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9FLG9CQUFBLFVBQVUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO2lCQUN0QjtnQkFFRCxJQUFJLFVBQVUsRUFBRTtBQUNkLG9CQUFBLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ2xDLG9CQUFBLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7aUJBQzFFO0FBQ0gsYUFBQyxDQUFDLENBQUM7WUFFSCxJQUFJLGFBQWEsRUFBRTtnQkFDakJHLDBCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ2hDO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sV0FBVyxDQUFDO0tBQ3BCO0lBRUQsZ0JBQWdCLENBQUMsSUFBc0IsRUFBRSxRQUFxQixFQUFBO1FBQzVELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLElBQUksRUFBRTtBQUNSLFlBQUEsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztBQUN0QixZQUFBLE1BQU0sZUFBZSxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUVsRCxJQUNFLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDO2dCQUN6RCxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQjtnQkFDaEMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQzNDO2dCQUNBLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQSxZQUFBLEVBQWUsSUFBSSxDQUFDLFdBQVcsQ0FBRSxDQUFBLENBQUMsQ0FBQzthQUN6RDtBQUVELFlBQUEsSUFBSSxDQUFDLCtCQUErQixDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUVoRSxNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMvQyxZQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDeEMsT0FBTyxHQUFHLElBQUksQ0FBQztTQUNoQjtBQUVELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7SUFFRCxrQkFBa0IsQ0FBQyxJQUFzQixFQUFFLEdBQStCLEVBQUE7UUFDeEUsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksSUFBSSxFQUFFO1lBQ1IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQTBCLENBQUM7WUFDekUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ3hDLFlBQUEsTUFBTSxTQUFTLEdBQWtCLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2xELFlBQUEsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztZQUV0QixJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUFDLFVBQVUsRUFBRTtnQkFDN0MsU0FBUyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQ3BELElBQXNDLENBQ3ZDLENBQUMsTUFBaUMsQ0FBQzthQUNyQztBQUVELFlBQUEsSUFBSSxDQUFDLDZCQUE2QixDQUNoQyxHQUFHLEVBQ0gsSUFBSSxFQUNKLFNBQVMsRUFDVCxJQUFJLEVBQ0osSUFBSSxDQUFDLFVBQVUsQ0FDaEIsQ0FBQyxJQUFJLENBQ0osTUFBSztBQUNILGdCQUFBLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7Z0JBRXhCLElBQUksYUFBYSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTtBQUNyRCxvQkFBQSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztpQkFDMUQ7QUFDSCxhQUFDLEVBQ0QsQ0FBQyxNQUFNLEtBQUk7Z0JBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FDVCxDQUFzRCxtREFBQSxFQUFBLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQSxFQUNqRSxNQUFNLENBQ1AsQ0FBQztBQUNKLGFBQUMsQ0FDRixDQUFDO1lBRUYsT0FBTyxHQUFHLElBQUksQ0FBQztTQUNoQjtBQUVELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7SUFFUSxLQUFLLEdBQUE7QUFDWixRQUFBLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0tBQ3ZCO0FBRVEsSUFBQSxrQkFBa0IsQ0FBQyxTQUFvQixFQUFBO1FBQzlDLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBeUIsQ0FBQztBQUM3RSxRQUFBLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5QyxRQUFBLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDOztBQUd4RSxRQUFBLE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFdEYsUUFBQSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxLQUFJO0FBQ3ZCLFlBQUEsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEtBQUssQ0FBQztZQUNyQixLQUFLLENBQUMsV0FBVyxHQUFHLFlBQVksR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakYsU0FBQyxDQUFDLENBQUM7QUFFSCxRQUFBLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDNUM7SUFFRCxnQkFBZ0IsQ0FBQyxJQUFVLEVBQUUsUUFBd0IsRUFBQTtBQUNuRCxRQUFBLElBQUksYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNwQyxZQUFBLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDM0IsWUFBQSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFM0MsWUFBQSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUMxQjtLQUNGO0FBRUQsSUFBQSw4QkFBOEIsQ0FDNUIsVUFBMEMsRUFBQTtBQUUxQyxRQUFBLE1BQU0sRUFDSixLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQ3BCLEdBQUcsRUFBRSxNQUFNLEdBQ1osR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQzs7O1FBSS9CLE9BQU87QUFDTCxZQUFBLE1BQU0sRUFBRTtBQUNOLGdCQUFBLE1BQU0sRUFBRSxJQUFJO0FBQ1osZ0JBQUEsS0FBSyxFQUFFLElBQUk7QUFDWCxnQkFBQSxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFO2dCQUN2QixNQUFNO2dCQUNOLElBQUk7QUFDSixnQkFBQSxNQUFNLEVBQUU7QUFDTixvQkFBQSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRTtBQUN2QixvQkFBQSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRTtBQUN0QixpQkFBQTtBQUNGLGFBQUE7U0FDRixDQUFDO0tBQ0g7QUFFTyxJQUFBLCtCQUErQixDQUNyQyxnQkFBK0IsRUFDL0IsVUFBeUIsRUFDekIsaUJBQTBCLEVBQzFCLFdBQXdCLEVBQUE7QUFFeEIsUUFBQSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3JDLElBQUksY0FBYyxHQUFlLElBQUksQ0FBQztBQUN0QyxRQUFBLElBQUksUUFBUSxHQUFTLElBQUksQ0FBQyxRQUFRLENBQUM7UUFFbkMsSUFBSSxhQUFhLEVBQUU7QUFDakIsWUFBQSxjQUFjLEdBQUksYUFBYSxDQUFDLGFBQWEsRUFBMkIsQ0FBQyxNQUFNLENBQUM7QUFDaEYsWUFBQSxRQUFRLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQztTQUMvQjs7UUFHRCxNQUFNLG1CQUFtQixHQUFHLFFBQVEsS0FBSyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUM7UUFDN0UsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOzs7UUFJaEUsSUFBSSxVQUFVLEdBQWUsSUFBSSxDQUFDO1FBQ2xDLElBQUksbUJBQW1CLEVBQUU7WUFDdkIsVUFBVSxHQUFHLGNBQWMsQ0FBQztTQUM3QjthQUFNLElBQUksY0FBYyxDQUFDLGFBQWEsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsRUFBRTtZQUMvRSxVQUFVLEdBQUcsY0FBYyxDQUFDO1NBQzdCO0FBQU0sYUFBQSxJQUFJLGdCQUFnQixDQUFDLGFBQWEsSUFBSSxpQkFBaUIsRUFBRTs7O1lBRzlELFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQztTQUMvQjtBQUVELFFBQUEsT0FBTyxVQUFVLENBQUM7S0FDbkI7QUFFRCxJQUFBLE1BQU0sUUFBUSxDQUFDLFVBQXNCLEVBQUUsYUFBc0IsRUFBQTtRQUMzRCxJQUFJLEtBQUssR0FBaUIsRUFBRSxDQUFDO1FBRTdCLElBQUksa0JBQWtCLEdBQUcsS0FBSyxDQUFDO1FBQy9CLElBQUksb0JBQW9CLEdBQUcsS0FBSyxDQUFDO1FBRWpDLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDbEIsQ0FBQyxFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRTtTQUNoRTtRQUVELEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUV4RSxJQUFJLG9CQUFvQixFQUFFO0FBQ3hCLFlBQUEsYUFBYSxDQUFDLHdCQUF3QixDQUNwQyxLQUF5QyxFQUN6QyxVQUFVLENBQ1gsQ0FBQztTQUNIO0FBRUQsUUFBQSxPQUFPLEtBQUssQ0FBQztLQUNkO0FBRU8sSUFBQSxPQUFPLHdCQUF3QixDQUNyQyxLQUF1QyxFQUN2QyxVQUFzQixFQUFBO0FBRXRCLFFBQUEsTUFBTSxVQUFVLEdBQUcsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUM7O1FBRzVDLElBQUksVUFBVSxFQUFFO1lBQ2QsSUFBSSxLQUFLLEdBQWUsSUFBSSxDQUFDO0FBQzdCLFlBQUEsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FDOUIsY0FBYyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FDekIsQ0FBQztBQUVGLFlBQUEsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO2dCQUNuQixLQUFLLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUk7QUFDcEMsb0JBQUEsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7b0JBQ3RELE1BQU0sT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRTFELG9CQUFBLE9BQU8sUUFBUSxHQUFHLE9BQU8sSUFBSSxRQUFRLElBQUksVUFBVSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7QUFDbkUsaUJBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFFRCxJQUFJLEtBQUssRUFBRTtBQUNULGdCQUFBLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO2FBQ3pCO1NBQ0Y7S0FDRjtBQUVELElBQUEsTUFBTSxvQkFBb0IsQ0FDeEIsVUFBc0IsRUFDdEIsaUJBQTBCLEVBQUE7UUFFMUIsTUFBTSxFQUNKLEdBQUcsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUN0QixTQUFTLEdBQ1YsR0FBRyxJQUFJLENBQUM7UUFDVCxNQUFNLEdBQUcsR0FBaUIsRUFBRSxDQUFDO0FBRTdCLFFBQUEsSUFBSSxVQUFVLEVBQUUsSUFBSSxFQUFFO0FBQ3BCLFlBQUEsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQztZQUM1QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFekQsWUFBQSxJQUFJLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3BDLE1BQU0sSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7YUFDbEU7aUJBQU07Z0JBQ0wsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFcEQsSUFBSSxVQUFVLEVBQUU7b0JBQ2QsTUFBTSxJQUFJLEdBQUcsQ0FBQyxPQUFBLEdBQWtDLEVBQUUsRUFBRSxVQUFzQixLQUFJO3dCQUM1RSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLEVBQUU7NEJBQ3hELE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQ3JCLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUNyRCxDQUFDO3lCQUNIO0FBQ0gscUJBQUMsQ0FBQztvQkFFRixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzlDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUMvRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFMUMsb0JBQUEsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQzlCLElBQUksRUFDSixVQUFVLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxFQUN4RCxHQUFHLEVBQ0gsY0FBYyxDQUNmLENBQUM7b0JBRUYsSUFBSSxpQkFBaUIsRUFBRTtBQUNyQix3QkFBQSxhQUFhLENBQUMsd0JBQXdCLENBQ3BDLEdBQXVDLENBQ3hDLENBQUM7cUJBQ0g7aUJBQ0Y7YUFDRjtTQUNGO0FBRUQsUUFBQSxPQUFPLEdBQUcsQ0FBQztLQUNaO0lBRUQsbUJBQW1CLENBQ2pCLFVBQStCLEVBQy9CLGNBQTJCLEVBQUE7UUFFM0IsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBRTFCLFFBQUEsSUFBSSxPQUFPLFVBQVUsS0FBSyxRQUFRLEVBQUU7WUFDbEMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQ2hFO2FBQU07WUFDTCxhQUFhO0FBQ1gsZ0JBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7b0JBQzdDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1NBQzlEO0FBRUQsUUFBQSxPQUFPLGFBQWEsQ0FBQztLQUN0QjtBQUVELElBQUEsTUFBTSwwQkFBMEIsQ0FDOUIsSUFBVyxFQUNYLFVBQXdCLEVBQ3hCLGNBQTJCLEVBQUE7QUFFM0IsUUFBQSxJQUFJLFdBQWdDLENBQUM7QUFFckMsUUFBQSxJQUFJO0FBQ0YsWUFBQSxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxRCxXQUFXLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQWdCLENBQUMsS0FBSyxDQUFDO1NBQzdEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsR0FBRyxDQUNULENBQXNFLG1FQUFBLEVBQUEsSUFBSSxDQUFDLElBQUksQ0FBRyxDQUFBLENBQUEsRUFDbEYsQ0FBQyxDQUNGLENBQUM7U0FDSDtBQUVELFFBQUEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO0FBQzlCLFlBQUEsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksS0FBSTtBQUMzQixnQkFBQSxJQUNFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsY0FBYyxDQUFDLEVBQzdFO29CQUNBLFVBQVUsQ0FBQyxJQUFJLENBQUM7QUFDZCx3QkFBQSxJQUFJLEVBQUUsWUFBWTt3QkFDbEIsVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO0FBQ2pDLHdCQUFBLE1BQU0sRUFBRSxFQUFFLEdBQUcsSUFBSSxFQUFFO0FBQ3BCLHFCQUFBLENBQUMsQ0FBQztpQkFDSjtBQUNILGFBQUMsQ0FBQyxDQUFDO1NBQ0o7S0FDRjtJQUVELE1BQU0scUJBQXFCLENBQ3pCLElBQVcsRUFDWCxZQUE0QixFQUM1QixVQUF3QixFQUN4QixjQUEyQixFQUFBO1FBRTNCLE1BQU0sRUFDSixHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FDZixHQUFHLElBQUksQ0FBQztBQUVULFFBQUEsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFbkYsSUFBSSxhQUFhLElBQUksWUFBWSxFQUFFLE1BQU0sSUFBSSxJQUFJLEVBQUU7WUFDakQsSUFBSSxXQUFXLEdBQVcsSUFBSSxDQUFDO0FBRS9CLFlBQUEsSUFBSTtnQkFDRixXQUFXLEdBQUcsTUFBTSxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzVDO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FDVCxDQUFrRSwrREFBQSxFQUFBLElBQUksQ0FBQyxJQUFJLENBQUcsQ0FBQSxDQUFBLEVBQzlFLENBQUMsQ0FDRixDQUFDO2FBQ0g7WUFFRCxJQUFJLFdBQVcsRUFBRTtBQUNmLGdCQUFBLEtBQUssTUFBTSxLQUFLLElBQUksWUFBWSxFQUFFO29CQUNoQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFDdEMsb0JBQUEsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDL0QsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO29CQUV0RSxJQUFJLEtBQUssRUFBRTtBQUNULHdCQUFBLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDN0IsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDN0Msd0JBQUEsTUFBTSxNQUFNLEdBQWlCO0FBQzNCLDRCQUFBLFlBQVksRUFBRSxZQUFZLENBQUMsSUFBSSxFQUFFOzRCQUNqQyxXQUFXO0FBQ1gsNEJBQUEsR0FBRyxLQUFLO3lCQUNULENBQUM7d0JBRUYsVUFBVSxDQUFDLElBQUksQ0FBQztBQUNkLDRCQUFBLElBQUksRUFBRSxZQUFZOzRCQUNsQixVQUFVLEVBQUUsVUFBVSxDQUFDLE9BQU87NEJBQzlCLE1BQU07QUFDUCx5QkFBQSxDQUFDLENBQUM7cUJBQ0o7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0Y7QUFFTyxJQUFBLGtCQUFrQixDQUN4QixRQUFxQixFQUNyQixVQUF3QixFQUN4QixjQUEyQixFQUFBO0FBRTNCLFFBQUEsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztBQUMxQixRQUFBLFFBQVEsR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO1FBRTFCLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLEVBQUU7QUFDN0QsWUFBQSxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsRUFBRTtBQUMzQixnQkFBQSxNQUFNLElBQUksR0FBVyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sVUFBVSxHQUFHLENBQUMsUUFBUSxDQUFDLG1CQUFtQixHQUFHLElBQUksTUFBTSxJQUFJLENBQUM7Z0JBRWxFLElBQUksQ0FBQyxVQUFVLEVBQUU7b0JBQ2YsVUFBVSxDQUFDLElBQUksQ0FBQztBQUNkLHdCQUFBLElBQUksRUFBRSxZQUFZO0FBQ2xCLHdCQUFBLE1BQU0sRUFBRSxJQUFJO3dCQUNaLFVBQVUsRUFBRSxVQUFVLENBQUMsSUFBSTtBQUM1QixxQkFBQSxDQUFDLENBQUM7aUJBQ0o7YUFDRjtTQUNGO0tBQ0Y7SUFFTyxPQUFPLHdCQUF3QixDQUNyQyxPQUF5QyxFQUFBO1FBRXpDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFJO1lBQ25DLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDNUMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUM1QyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDM0MsWUFBQSxPQUFPLFFBQVEsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQztBQUM3RCxTQUFDLENBQUMsQ0FBQztRQUVILElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztBQUV4QixRQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUk7WUFDcEIsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLFlBQUEsSUFBSSxjQUFjLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzdCLGdCQUFBLGVBQWUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDbEMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQzthQUNuQztpQkFBTTtnQkFDTCxXQUFXLEdBQUcsZUFBZSxDQUFDO2FBQy9CO0FBRUQsWUFBQSxFQUFFLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztBQUMvQixTQUFDLENBQUMsQ0FBQztBQUVILFFBQUEsT0FBTyxNQUFNLENBQUM7S0FDZjtJQUVELE9BQU8sMEJBQTBCLENBQUMsVUFBc0IsRUFBQTtBQUN0RCxRQUFBLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUM7QUFDOUIsUUFBQSxJQUFJLElBQUksQ0FBQztBQUVULFFBQUEsSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDMUIsWUFBQSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztTQUN2QjtBQUFNLGFBQUEsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDN0IsSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzVCO0FBQU0sYUFBQSxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNqQyxZQUFBLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO1NBQzVCO2FBQU0sSUFBSSxhQUFhLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxFQUFFO0FBQ2xFLFlBQUEsSUFBSSxHQUFHLGFBQWEsQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM3RDthQUFNO1lBQ0wsTUFBTSxRQUFRLEdBQUcsTUFBd0IsQ0FBQztZQUMxQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLFFBQVEsRUFBRTtBQUM1QixZQUFBLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxRQUFRLENBQUM7QUFFakMsWUFBQSxJQUFJLFdBQVcsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO0FBQ3ZDLGdCQUFBLElBQUksSUFBSSxDQUFBLENBQUEsRUFBSSxXQUFXLENBQUEsQ0FBRSxDQUFDO2FBQzNCO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCxPQUFPLDhCQUE4QixDQUFDLElBQXVCLEVBQUE7UUFDM0QsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBRWQsUUFBQSxNQUFNLFNBQVMsR0FBaUM7QUFDOUMsWUFBQSxJQUFJLEVBQUUsTUFBTyxJQUF1QixDQUFDLElBQUk7QUFDekMsWUFBQSxJQUFJLEVBQUUsTUFBTyxJQUF1QixDQUFDLElBQUk7QUFDekMsWUFBQSxJQUFJLEVBQUUsTUFBTyxJQUF1QixDQUFDLEdBQUc7QUFDeEMsWUFBQSxLQUFLLEVBQUUsTUFBTyxJQUF3QixDQUFDLEtBQUs7U0FDN0MsQ0FBQztRQUVGLE1BQU0sRUFBRSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxFQUFFLEVBQUU7WUFDTixJQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7U0FDYjtBQUVELFFBQUEsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUVELGtCQUFrQixDQUFDLFVBQXNCLEVBQUUsUUFBcUIsRUFBQTtBQUM5RCxRQUFBLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDO0FBQzFDLFFBQUEsTUFBTSxjQUFjLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRTdELFFBQUEsSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDMUIsWUFBQSxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFDcEYsWUFBQSxNQUFNLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUM7QUFDakQsZ0JBQUEsR0FBRyxFQUFFLGNBQWM7O0FBRW5CLGdCQUFBLElBQUksRUFBRSxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFO0FBQzdDLGFBQUEsQ0FBQyxDQUFDOztZQUdILE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3RFLFlBQUFOLGdCQUFPLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ25DO2FBQU0sSUFBSSxhQUFhLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQ2xFLE1BQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3BFO2FBQU07QUFDTCxZQUFBLElBQUksU0FBaUIsQ0FBQztBQUV0QixZQUFBLElBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzFCLGdCQUFBLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDN0M7aUJBQU07QUFDTCxnQkFBQSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDMUM7WUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDekU7S0FDRjtBQUVELElBQUEsT0FBTyxxQkFBcUIsQ0FDMUIsVUFBc0IsRUFDdEIsT0FBNkIsRUFBQTtBQUU3QixRQUFBLE9BQU8sVUFBVSxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsVUFBVSxDQUFDO0tBQ3hEO0lBRUQsT0FBTyxZQUFZLENBQUMsVUFBaUIsRUFBQTtBQUNuQyxRQUFBLE9BQU8sVUFBVSxFQUFFLFNBQVMsS0FBSyxRQUFRLENBQUM7S0FDM0M7SUFFRCxPQUFPLFlBQVksQ0FBQyxJQUFVLEVBQUE7QUFDNUIsUUFBQSxPQUFPLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxRQUFRLENBQUM7S0FDekM7QUFDRjs7QUM1bEJNLE1BQU0seUJBQXlCLEdBQUcsaUJBQWlCLENBQUM7QUFHM0QsTUFBTSx5QkFBeUIsR0FBYSxFQUFFLENBQUM7QUFFekMsTUFBTyxjQUFlLFNBQVEsT0FBMEIsQ0FBQTtBQUM1RCxJQUFBLGdCQUFnQixDQUFDLFlBQTBCLEVBQUE7QUFDekMsUUFBQSxPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUM7S0FDMUM7SUFFRCxlQUFlLENBQ2IsU0FBb0IsRUFDcEIsS0FBYSxFQUNiLFVBQWtCLEVBQ2xCLGlCQUFnQyxFQUNoQyxXQUEwQixFQUFBO1FBRTFCLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBRXRELFFBQUEsSUFBSSxJQUFJLENBQUMsc0NBQXNDLEVBQUUsRUFBRTtBQUNqRCxZQUFBLFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUVsQyxZQUFBLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLFlBQUEsR0FBRyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7QUFDN0IsWUFBQSxHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztTQUN4QjtBQUVELFFBQUEsT0FBTyxHQUFHLENBQUM7S0FDWjtBQUVELElBQUEsY0FBYyxDQUFDLFNBQW9CLEVBQUE7UUFDakMsTUFBTSxXQUFXLEdBQXdCLEVBQUUsQ0FBQztRQUU1QyxJQUFJLFNBQVMsRUFBRTtZQUNiLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzdCLE1BQU0sRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQztZQUMzRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUUxRCxZQUFBLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUk7Z0JBQ3pCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQztnQkFDdEIsSUFBSSxLQUFLLEdBQWlCLElBQUksQ0FBQztnQkFFL0IsSUFBSSxhQUFhLEVBQUU7b0JBQ2pCLEtBQUssR0FBR0csb0JBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5QyxvQkFBQSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztpQkFDdEI7Z0JBRUQsSUFBSSxVQUFVLEVBQUU7QUFDZCxvQkFBQSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDdEQ7QUFDSCxhQUFDLENBQUMsQ0FBQztZQUVILElBQUksYUFBYSxFQUFFO2dCQUNqQkcsMEJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDaEM7U0FDRjtBQUVELFFBQUEsT0FBTyxXQUFXLENBQUM7S0FDcEI7SUFFRCxnQkFBZ0IsQ0FBQyxJQUF1QixFQUFFLFFBQXFCLEVBQUE7UUFDN0QsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksSUFBSSxFQUFFO1lBQ1IsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztZQUNqRCxJQUFJLENBQUMsK0JBQStCLENBQUMsUUFBUSxFQUFFLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFL0MsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDN0QsWUFBQSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUM7QUFFakUsWUFBQSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3ZEO1lBRUQsSUFBSSxRQUFRLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDMUQ7aUJBQU0sSUFBSSxRQUFRLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7YUFDakU7WUFFRCxPQUFPLEdBQUcsSUFBSSxDQUFDO1NBQ2hCO0FBRUQsUUFBQSxPQUFPLE9BQU8sQ0FBQztLQUNoQjtBQUVELElBQUEsc0JBQXNCLENBQUMsRUFBVSxFQUFFLEdBQVEsRUFBRSxnQkFBNkIsRUFBQTtBQUN4RSxRQUFBLElBQUk7QUFDRixZQUFBLE1BQU0sRUFBRSxhQUFhLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFFOUIsWUFBQSxJQUFJLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksYUFBYSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUN2RSxNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFMUQsZ0JBQUEsSUFBSSxTQUFTLEVBQUUsTUFBTSxFQUFFO0FBQ3JCLG9CQUFBLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUU7QUFDL0Isd0JBQUEsR0FBRyxFQUFFLG1CQUFtQjtBQUN4Qix3QkFBQSxJQUFJLEVBQUUsU0FBUztBQUNoQixxQkFBQSxDQUFDLENBQUM7aUJBQ0o7YUFDRjtTQUNGO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLHFEQUFxRCxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM3RTtLQUNGO0FBRUQsSUFBQSxrQkFBa0IsQ0FBQyxJQUF1QixFQUFBO1FBQ3hDLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLElBQUksRUFBRTtBQUNSLFlBQUEsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLHlCQUF5QixDQUFDLENBQUM7WUFDekQsT0FBTyxHQUFHLElBQUksQ0FBQztTQUNoQjtBQUVELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7SUFFRCxlQUFlLENBQUMsU0FBaUIsRUFBRSxnQkFBMEIsRUFBQTtRQUMzRCxJQUFJLGdCQUFnQixFQUFFO1lBQ3BCLE1BQU0sUUFBUSxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNyRCxZQUFBLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQ2pCLGdCQUFBLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDdEM7QUFFRCxZQUFBLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNwQyxZQUFBLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUM3QjtLQUNGO0lBRUQsUUFBUSxDQUFDLFNBQW9CLEVBQUUsa0JBQTJCLEVBQUE7UUFDeEQsSUFBSSxLQUFLLEdBQWtCLEVBQUUsQ0FBQztRQUM5QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDekQsUUFBQSxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztRQUU5QyxJQUFJLGVBQWUsRUFBRTtBQUNuQixZQUFBLEtBQUssR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDekQ7YUFBTSxJQUFJLGtCQUFrQixFQUFFO0FBQzdCLFlBQUEsS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUMvQjthQUFNO1lBQ0wsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDekUsWUFBQSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLGdCQUFnQixHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUM1RTtBQUVELFFBQUEsT0FBTyxLQUFLLENBQUM7S0FDZDtBQUVELElBQUEsMEJBQTBCLENBQUMsY0FBMkIsRUFBQTtRQUNwRCxNQUFNLEtBQUssR0FBa0IsRUFBRSxDQUFDO0FBQ2hDLFFBQUEsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDaEQsUUFBQSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUVoRCxRQUFBLE1BQU0sZUFBZSxHQUFHLENBQUMsRUFBVSxLQUFJO1lBQ3JDLElBQUksT0FBTyxHQUFnQixJQUFJLENBQUM7QUFDaEMsWUFBQSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFOUMsSUFBSSxHQUFHLEVBQUU7QUFDUCxnQkFBQSxPQUFPLEdBQUc7QUFDUixvQkFBQSxRQUFRLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDOUIsb0JBQUEsUUFBUSxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUM5QixHQUFHO2lCQUNKLENBQUM7YUFDSDtBQUVELFlBQUEsT0FBTyxPQUFPLENBQUM7QUFDakIsU0FBQyxDQUFDO0FBRUYsUUFBQSxNQUFNLGNBQWMsR0FBRyxDQUFDLE9BQWUsRUFBRSxNQUFnQixLQUFJO1lBQzNELElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFDL0MsZ0JBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsS0FBSTtBQUNwQixvQkFBQSxNQUFNLE9BQU8sR0FBRyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBRXBDLElBQUksT0FBTyxFQUFFO0FBQ1gsd0JBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDckI7QUFDSCxpQkFBQyxDQUFDLENBQUM7YUFDSjtBQUNILFNBQUMsQ0FBQztBQUVGLFFBQUEsY0FBYyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7QUFFckUsUUFBQSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUN4QyxjQUFjLEVBQ2QsbUJBQW1CLENBQUMsTUFBTSxDQUMzQixDQUFDOzs7UUFJRixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU07Ozs7QUFJL0MsUUFBQSxDQUFDLEVBQUUsS0FBSyxDQUFDLGVBQWUsS0FBSyxlQUFlLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3ZFLENBQUM7QUFFRixRQUFBLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFFdEQsUUFBQSxPQUFPLEtBQUssQ0FBQztLQUNkO0lBRUQsY0FBYyxHQUFBO0FBQ1osUUFBQSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUNoRCxRQUFBLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBRWhELFFBQUEsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVE7QUFDckIsYUFBQSxZQUFZLEVBQUU7QUFDZixjQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdDLGFBQUEsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFJO1lBQ1gsT0FBTztnQkFDTCxRQUFRLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNsQyxRQUFRLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNsQyxHQUFHO2FBQ0osQ0FBQztBQUNKLFNBQUMsQ0FBQyxDQUFDO0tBQ047SUFFRCxtQkFBbUIsR0FBQTtRQUNqQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsc0NBQXNDLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO0FBQzNFLFFBQUEsT0FBTyxJQUFJLEdBQUcsQ0FBUyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUM7S0FDbkM7SUFFRCxtQkFBbUIsR0FBQTtBQUNqQixRQUFBLE9BQU8sSUFBSSxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztLQUMzQztJQUVELGdCQUFnQixDQUFDLFdBQXdCLEVBQUUsS0FBbUIsRUFBQTtRQUM1RCxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxXQUFXLENBQUM7QUFDaEQsUUFBQSxNQUFNLElBQUksR0FBc0I7WUFDOUIsSUFBSSxFQUFFLGNBQWMsQ0FBQyxXQUFXO0FBQ2hDLFlBQUEsSUFBSSxFQUFFLEdBQUc7WUFDVCxRQUFRO1lBQ1IsUUFBUTtZQUNSLEtBQUs7U0FDTixDQUFDO0FBRUYsUUFBQSxPQUFPLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNqRDtJQUVELHNDQUFzQyxHQUFBO1FBQ3BDLE9BQU8sNEJBQTRCLENBQ2pDLElBQUksQ0FBQyxHQUFHLEVBQ1IseUJBQXlCLENBQ00sQ0FBQztLQUNuQztBQUNGOztBQ3pPSyxNQUFPLG1CQUFvQixTQUFRLE9BRXhDLENBQUE7QUFHQyxJQUFBLGdCQUFnQixDQUFDLFdBQXlCLEVBQUE7QUFDeEMsUUFBQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQzFCLE9BQU8sV0FBVyxFQUFFLHVCQUF1QjtjQUN2QyxRQUFRLENBQUMsbUNBQW1DO0FBQzlDLGNBQUUsUUFBUSxDQUFDLHVCQUF1QixDQUFDO0tBQ3RDO0lBRUQsZUFBZSxDQUNiLFNBQW9CLEVBQ3BCLEtBQWEsRUFDYixVQUFrQixFQUNsQixnQkFBK0IsRUFDL0IsVUFBeUIsRUFBQTtRQUV6QixNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBeUIsQ0FBQztBQUNuRixRQUFBLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQ25DLGdCQUFnQixFQUNoQixVQUFVLEVBQ1YsS0FBSyxLQUFLLENBQUMsRUFDWCxTQUFTLENBQUMsV0FBVyxDQUN0QixDQUFDO1FBRUYsSUFBSSxVQUFVLEVBQUU7QUFDZCxZQUFBLFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0FBRXZDLFlBQUEsR0FBRyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7QUFDeEIsWUFBQSxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNsQixZQUFBLEdBQUcsQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0FBQzdCLFlBQUEsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7U0FDeEI7QUFFRCxRQUFBLE9BQU8sR0FBRyxDQUFDO0tBQ1o7QUFFRCxJQUFBLGNBQWMsQ0FDWixTQUFvQixFQUFBO1FBRXBCLE1BQU0sV0FBVyxHQUFzRCxFQUFFLENBQUM7UUFFMUUsSUFBSSxTQUFTLEVBQUU7QUFDYixZQUFBLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzNCLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBRTdCLFlBQUEsTUFBTSxFQUFFLGFBQWEsRUFBRSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUM7WUFDaEQsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQXlCLENBQUM7QUFDbkYsWUFBQSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFFbkQsWUFBQSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFJO2dCQUNyQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLElBQUksRUFBRTtBQUNSLG9CQUFBLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3hCO0FBQ0gsYUFBQyxDQUFDLENBQUM7WUFFSCxJQUFJLGFBQWEsRUFBRTtnQkFDakJBLDBCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ2hDO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sV0FBVyxDQUFDO0tBQ3BCO0lBRUQsZ0JBQWdCLENBQUMsSUFBNEIsRUFBRSxRQUFxQixFQUFBO1FBQ2xFLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLElBQUksRUFBRTtZQUNSLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFFOUMsWUFBQSxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBdUI7QUFDNUMsZ0JBQUEsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDO0FBQzFDLGdCQUFBLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUM7QUFDMUMsZ0JBQUEsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLGlCQUFpQixDQUFDO0FBQy9DLGFBQUEsQ0FBQyxDQUFDO1lBRUgsUUFBUSxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFL0QsWUFBQSxJQUFJLENBQUMscUJBQXFCLENBQ3hCLFFBQVEsRUFDUixDQUFDLHdCQUF3QixDQUFDLEVBQzFCLElBQUksQ0FBQyxjQUFjLEVBQ25CLElBQUksRUFDSixTQUFTLEVBQ1QsS0FBSyxDQUNOLENBQUM7WUFFRixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFFdkUsWUFBQSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFOztBQUVuQixnQkFBQSxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQSxFQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFBLENBQUUsQ0FBQyxDQUFDO2FBQ3hFOztBQUdELFlBQUEsSUFBSSxDQUFDLGVBQWUsQ0FDbEIsZ0JBQWdCLEVBQ2hCLENBQUMsdUJBQXVCLENBQUMsRUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQy9CLENBQUM7WUFFRixPQUFPLEdBQUcsSUFBSSxDQUFDO1NBQ2hCO0FBRUQsUUFBQSxPQUFPLE9BQU8sQ0FBQztLQUNoQjtJQUVELGtCQUFrQixDQUNoQixJQUE0QixFQUM1QixHQUErQixFQUFBO1FBRS9CLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLElBQUksRUFBRTtBQUNSLFlBQUEsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztBQUV0QixZQUFBLElBQUksQ0FBQyx3QkFBd0IsQ0FDM0IsR0FBRyxFQUNILElBQUksRUFDSixDQUFBLDRCQUFBLEVBQStCLElBQUksQ0FBQyxJQUFJLENBQUEsQ0FBRSxDQUMzQyxDQUFDO1lBRUYsT0FBTyxHQUFHLElBQUksQ0FBQztTQUNoQjtBQUVELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7SUFFRCxpQkFBaUIsQ0FBQyxJQUFzQixFQUFFLGVBQTRCLEVBQUE7UUFDcEUsSUFBSSxJQUFJLEdBQVcsSUFBSSxDQUFDO0FBQ3hCLFFBQUEsTUFBTSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFdEMsSUFBSSxJQUFJLEVBQUU7QUFDUixZQUFBLElBQUksZUFBZSxLQUFLLElBQUksRUFBRTtnQkFDNUIsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQzthQUMvQztTQUNGO2FBQU07QUFDTCxZQUFBLE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO1lBRTlDLElBQUksWUFBWSxFQUFFO2dCQUNoQixJQUFJLEdBQUcsY0FBYyxDQUFDO2FBQ3ZCO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCx5QkFBeUIsQ0FDdkIsU0FBb0IsRUFDcEIsSUFBc0IsRUFBQTtBQUV0QixRQUFBLE1BQU0sRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3RDLFFBQUEsSUFBSSxNQUFNLEdBQTZCLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDO1FBQ2xGLE1BQU0sWUFBWSxHQUFHLElBQUksS0FBSyxJQUFJLElBQUksY0FBYyxFQUFFLE1BQU0sQ0FBQztBQUU3RCxRQUFBLE1BQU0sRUFDSix1QkFBdUIsRUFDdkIsV0FBVyxFQUFFLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxHQUMxQyxHQUFHLFNBQVMsQ0FBQztRQUVkLE1BQU0sRUFDSixRQUFRLEVBQ1IsR0FBRyxFQUFFLEVBQUUsYUFBYSxFQUFFLEdBQ3ZCLEdBQUcsSUFBSSxDQUFDO0FBRVQsUUFBQSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBRXRGLElBQUksYUFBYSxFQUFFO1lBQ2pCLE1BQU0sR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN2RSxJQUFJLE1BQU0sQ0FBQyxTQUFTLEtBQUssU0FBUyxDQUFDLElBQUksRUFBRTtBQUN2QyxnQkFBQSxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sWUFBWTtBQUNqQixjQUFFLGlCQUFpQixDQUFDLDBCQUEwQixDQUMxQyxjQUFjLEVBQ2QsTUFBTSxFQUNOLFFBQVEsRUFDUixhQUFhLENBQ2Q7QUFDSCxjQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0tBQ2xGO0lBRUQsUUFBUSxDQUFDLFVBQXNCLEVBQUUsU0FBb0IsRUFBQTtRQUNuRCxNQUFNLFlBQVksR0FBdUIsRUFBRSxDQUFDO0FBQzVDLFFBQUEsTUFBTSxFQUFFLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDbkMsUUFBQSxNQUFNLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxHQUFHLFVBQVUsQ0FBQztRQUN4QyxNQUFNLG1CQUFtQixHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUN2RSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFekQsUUFBQSxNQUFNLHFCQUFxQixHQUFHLENBQUMsWUFBMEIsS0FBSTtBQUMzRCxZQUFBLFFBQ0UsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztnQkFDckMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDLEVBQ2hEO0FBQ0osU0FBQyxDQUFDO0FBRUYsUUFBQSxJQUFJLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUNoRCxZQUFBLElBQUksVUFBVSxHQUFHLElBQUksRUFBRSxJQUFJLENBQUM7QUFDNUIsWUFBQSxJQUFJLE9BQU8sR0FBRyxhQUFhLENBQUMsYUFBYSxDQUFDO0FBRTFDLFlBQUEsSUFBSSxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUN0QyxnQkFBQSxVQUFVLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztBQUNqQyxnQkFBQSxPQUFPLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQzthQUN6QztZQUVELElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztTQUN0RDtBQUVELFFBQUEsSUFBSSxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLEVBQUU7QUFDcEQsWUFBQSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQzlDO0FBRUQsUUFBQSxJQUFJLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsRUFBRTtBQUNwRCxZQUFBLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDM0M7QUFFRCxRQUFBLE9BQU8sWUFBWSxDQUFDO0tBQ3JCO0lBRUQsbUJBQW1CLENBQUMsVUFBaUIsRUFBRSxVQUE4QixFQUFBO1FBQ25FLE1BQU0sRUFBRSxxQkFBcUIsRUFBRSx1QkFBdUIsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFFekUsSUFBSSxVQUFVLEVBQUU7QUFDZCxZQUFBLE1BQU0sZ0JBQWdCLEdBQUcscUJBQXFCLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUN0RSxJQUFJLEtBQUssR0FBb0IsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFN0QsWUFBQSxPQUFPLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3ZCLGdCQUFBLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUV6QixnQkFBQSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNqQixvQkFBQSxNQUFNLFlBQVksR0FBRyxJQUFJLEtBQUssVUFBVSxDQUFDO29CQUN6QyxNQUFNLFVBQVUsR0FDZCxZQUFZO0FBQ1oseUJBQUMsdUJBQXVCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFbEUsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNmLHdCQUFBLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztxQkFDMUU7aUJBQ0Y7cUJBQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDdkMsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUUsSUFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDbEQ7YUFDRjtTQUNGO0tBQ0Y7SUFFRCxnQkFBZ0IsQ0FBQyxVQUFpQixFQUFFLFVBQThCLEVBQUE7UUFDaEUsSUFBSSxVQUFVLEVBQUU7QUFDZCxZQUFBLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUE0QixDQUFDO0FBQzNELFlBQUEsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQTJCLENBQUM7QUFDckQsWUFBQSxNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNuQyxZQUFBLE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUN6RSxNQUFNLGNBQWMsR0FBRyxDQUFDLElBQXNCLEtBQzVDLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7QUFFckMsWUFBQSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxLQUFJO0FBQ2xDLGdCQUFBLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDaEMsZ0JBQUEsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0UsZ0JBQUEsSUFBSSxJQUFzQixDQUFDO2dCQUUzQixJQUFJLFFBQVEsRUFBRTtBQUNaLG9CQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLFFBQVEsS0FBSyxVQUFVLEVBQUU7QUFDdkUsd0JBQUEsSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDN0Usd0JBQUEsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDOUIsd0JBQUEsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDdkI7aUJBQ0Y7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7QUFDakQsd0JBQUEsSUFBSSxHQUFHO0FBQ0wsNEJBQUEsSUFBSSxFQUFFLElBQUk7NEJBQ1YsWUFBWSxFQUFFLFlBQVksQ0FBQyxZQUFZO0FBQ3ZDLDRCQUFBLGNBQWMsRUFBRSxRQUFRO0FBQ3hCLDRCQUFBLEtBQUssRUFBRSxDQUFDO3lCQUNULENBQUM7QUFFRix3QkFBQSxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuQyx3QkFBQSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUN2QjtpQkFDRjtBQUNILGFBQUMsQ0FBQyxDQUFDO1NBQ0o7S0FDRjtBQUVELElBQUEsWUFBWSxDQUNWLFVBQWtCLEVBQ2xCLE9BQStDLEVBQy9DLFVBQThCLEVBQUE7QUFFOUIsUUFBQSxLQUFLLE1BQU0sQ0FBQyxjQUFjLEVBQUUsV0FBVyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNuRSxJQUNFLGNBQWMsS0FBSyxVQUFVO0FBQzdCLGdCQUFBLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLEVBQzdEO0FBQ0EsZ0JBQUEsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUV2RCxJQUFJLFVBQVUsRUFBRTtvQkFDZCxVQUFVLENBQUMsSUFBSSxDQUFDO3dCQUNkLEtBQUs7QUFDTCx3QkFBQSxJQUFJLEVBQUUsVUFBVTt3QkFDaEIsWUFBWSxFQUFFLFlBQVksQ0FBQyxRQUFRO0FBQ3BDLHFCQUFBLENBQUMsQ0FBQztpQkFDSjthQUNGO1NBQ0Y7S0FDRjtJQUVRLEtBQUssR0FBQTtBQUNaLFFBQUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7S0FDdkI7QUFFTyxJQUFBLGFBQWEsQ0FDbkIsZ0JBQStCLEVBQy9CLFVBQXlCLEVBQ3pCLFdBQW9CLEVBQ3BCLFdBQXdCLEVBQUE7QUFFeEIsUUFBQSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3JDLElBQUksY0FBYyxHQUFlLElBQUksQ0FBQztBQUN0QyxRQUFBLElBQUksUUFBUSxHQUFTLElBQUksQ0FBQyxRQUFRLENBQUM7UUFFbkMsSUFBSSxhQUFhLEVBQUU7QUFDakIsWUFBQSxjQUFjLEdBQUksYUFBYSxDQUFDLGFBQWEsRUFBMkIsQ0FBQyxNQUFNLENBQUM7QUFDaEYsWUFBQSxRQUFRLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQztTQUMvQjs7UUFHRCxNQUFNLGFBQWEsR0FBRyxRQUFRLEtBQUssSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUM7UUFDN0UsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRWhFLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxJQUFJLHNCQUFzQixDQUFDLGdCQUFnQixDQUFDLEVBQUU7OztBQUc3RSxZQUFBLGNBQWMsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1NBQ3JDOzs7UUFJRCxJQUFJLFVBQVUsR0FBZSxJQUFJLENBQUM7UUFDbEMsSUFBSSxhQUFhLEVBQUU7WUFDakIsVUFBVSxHQUFHLGNBQWMsQ0FBQztTQUM3QjthQUFNLElBQUksY0FBYyxDQUFDLGFBQWEsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsRUFBRTtZQUMvRSxVQUFVLEdBQUcsY0FBYyxDQUFDO1NBQzdCO0FBQU0sYUFBQSxJQUFJLGdCQUFnQixDQUFDLGFBQWEsSUFBSSxXQUFXLEVBQUU7WUFDeEQsVUFBVSxHQUFHLGdCQUFnQixDQUFDO1NBQy9CO0FBRUQsUUFBQSxPQUFPLFVBQVUsQ0FBQztLQUNuQjtBQUVELElBQUEsZ0JBQWdCLENBQ2QsdUJBQXlDLEVBQ3pDLElBQXNCLEVBQ3RCLE1BQWdDLEVBQ2hDLGNBQXNCLEVBQUE7QUFFdEIsUUFBQSxJQUFJLElBQUksR0FBMkI7WUFDakMsSUFBSTtZQUNKLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSTtZQUNoQixJQUFJLEVBQUUsY0FBYyxDQUFDLGdCQUFnQjtZQUNyQyxjQUFjO0FBQ2QsWUFBQSxHQUFHLE1BQU07U0FDVixDQUFDO1FBRUYsSUFBSSxHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzRSxRQUFBLE9BQU8sSUFBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2pEO0FBQ0Y7O0FDMVhLLE1BQU8sWUFBYSxTQUFRLE9BQXdCLENBQUE7QUFBMUQsSUFBQSxXQUFBLEdBQUE7O0FBQ0UsUUFBQSxJQUFBLENBQUEsd0JBQXdCLEdBQW9CO1lBQzFDLElBQUksRUFBRSxjQUFjLENBQUMsU0FBUztBQUM5QixZQUFBLEtBQUssRUFBRSxJQUFJO0FBQ1gsWUFBQSxJQUFJLEVBQUUsSUFBSTtBQUNWLFlBQUEsWUFBWSxFQUFFLElBQUk7U0FDbkIsQ0FBQztLQXFKSDtBQW5KQyxJQUFBLGdCQUFnQixDQUFDLFlBQTBCLEVBQUE7QUFDekMsUUFBQSxPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLENBQUM7S0FDeEM7SUFFRCxlQUFlLENBQ2IsU0FBb0IsRUFDcEIsS0FBYSxFQUNiLFVBQWtCLEVBQ2xCLGlCQUFnQyxFQUNoQyxXQUEwQixFQUFBO0FBRTFCLFFBQUEsU0FBUyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRWhDLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3BELFFBQUEsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbEIsUUFBQSxHQUFHLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUM3QixRQUFBLEdBQUcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBRXZCLFFBQUEsT0FBTyxHQUFHLENBQUM7S0FDWjtBQUVELElBQUEsY0FBYyxDQUFDLFNBQW9CLEVBQUE7UUFDakMsTUFBTSxXQUFXLEdBQXNCLEVBQUUsQ0FBQztRQUUxQyxJQUFJLFNBQVMsRUFBRTtZQUNiLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzdCLE1BQU0sRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQztBQUMzRCxZQUFBLE1BQU0sS0FBSyxHQUFHUCxpQkFBUSxDQUFDLFNBQVM7QUFDOUIsa0JBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixrQkFBRSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBRXBDLFlBQUEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksS0FBSTtnQkFDckIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDO2dCQUV0QixJQUFJLGFBQWEsRUFBRTtBQUNqQixvQkFBQSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQzFDLFNBQVMsRUFDVCxJQUFJLEVBQ0osSUFBSSxDQUFDLFlBQVksQ0FDbEIsQ0FBQztBQUVGLG9CQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLG9CQUFBLFVBQVUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztpQkFDOUI7Z0JBRUQsSUFBSSxVQUFVLEVBQUU7QUFDZCxvQkFBQSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN4QjtBQUNILGFBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxhQUFhLEVBQUU7Z0JBQ2pCTywwQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUNoQztTQUNGO0FBRUQsUUFBQSxPQUFPLFdBQVcsQ0FBQztLQUNwQjtJQUVELGdCQUFnQixDQUFDLElBQXFCLEVBQUUsUUFBcUIsRUFBQTtRQUMzRCxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxJQUFJLEVBQUU7WUFDUixJQUFJLENBQUMsK0JBQStCLENBQUMsUUFBUSxFQUFFLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1lBQ3pFLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFFZixZQUFBLElBQUlQLGlCQUFRLENBQUMsU0FBUyxFQUFFO0FBQ3RCLGdCQUFBLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDNUM7QUFBTSxpQkFBQSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsd0JBQXdCLEVBQUU7QUFDakQsZ0JBQUEsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzNDO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0FBRUQsSUFBQSwwQkFBMEIsQ0FBQyxRQUFxQixFQUFBO1FBQzlDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLDJCQUEyQixFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ2pFO0lBRUQscUJBQXFCLENBQUMsSUFBcUIsRUFBRSxRQUFxQixFQUFBO0FBQ2hFLFFBQUEsTUFBTSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDekMsUUFBQSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQztBQUV6QixRQUFBLElBQUksU0FBUyxLQUFLLFNBQVMsQ0FBQyxRQUFRLEVBQUU7WUFDcEMsYUFBYSxHQUFHLEtBQUssQ0FBQztZQUN0QixLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ2Q7QUFFRCxRQUFBLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDckYsUUFBQSxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hGLFFBQUEsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3JFLFFBQUEsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBRXpELFFBQUFDLGdCQUFPLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzFCQyxzQkFBYSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ2pEO0lBRUQsa0JBQWtCLENBQUMsSUFBcUIsRUFBRSxJQUFnQyxFQUFBO1FBQ3hFLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLElBQUksRUFBRTtBQUNSLFlBQUEsSUFBSUYsaUJBQVEsQ0FBQyxTQUFTLEVBQUU7O0FBRXRCLGdCQUFBLE9BQU8sR0FBR1Esb0JBQVcsQ0FBQyxRQUFRLENBQzVCLFlBQVksRUFDWixJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksRUFDdkIsS0FBSyxDQUNLLENBQUM7YUFDZDtBQUFNLGlCQUFBLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyx3QkFBd0IsRUFBRTs7QUFFakQsZ0JBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUM1QixPQUFPLEdBQUcsSUFBSSxDQUFDO2FBQ2hCO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0lBRUQsUUFBUSxHQUFBO1FBQ04sTUFBTSxLQUFLLEdBQXNCLEVBQUUsQ0FBQztBQUVwQyxRQUFBLElBQUk7OztZQUdGLE1BQU0sU0FBUyxHQUFHQSxvQkFBVyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQWMsQ0FBQztZQUVsRSxJQUFJLFNBQVMsRUFBRTtBQUNiLGdCQUFBLEtBQUssTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDNUQsb0JBQUEsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsb0JBQUEsTUFBTSxJQUFJLEdBQW9CO3dCQUM1QixJQUFJLEVBQUUsY0FBYyxDQUFDLFNBQVM7QUFDOUIsd0JBQUEsS0FBSyxFQUFFLElBQUk7QUFDWCx3QkFBQSxJQUFJLEVBQUUsRUFBRTt3QkFDUixNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUk7QUFDZCx3QkFBQSxZQUFZLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO3FCQUNqQyxDQUFDO0FBRUYsb0JBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDbEI7YUFDRjtTQUNGO1FBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixZQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMseURBQXlELEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDN0U7UUFFRCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUNyQixDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FDL0QsQ0FBQztLQUNIO0FBQ0Y7O0FDdElELE1BQU0sbUJBQW1CLEdBQUcsRUFBNkIsQ0FBQztNQUU3QyxXQUFXLENBQUE7QUFjdEIsSUFBQSxXQUFBLENBQ1UsR0FBUSxFQUNSLFFBQThCLEVBQy9CLFFBQTRCLEVBQUE7UUFGM0IsSUFBRyxDQUFBLEdBQUEsR0FBSCxHQUFHLENBQUs7UUFDUixJQUFRLENBQUEsUUFBQSxHQUFSLFFBQVEsQ0FBc0I7UUFDL0IsSUFBUSxDQUFBLFFBQUEsR0FBUixRQUFRLENBQW9CO1FBTnJDLElBQVcsQ0FBQSxXQUFBLEdBQWdCLEVBQUUsQ0FBQztRQUM5QixJQUFtQixDQUFBLG1CQUFBLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzs7O1FBUzVELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDL0QsUUFBQSxNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBaUQ7WUFDN0UsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksYUFBYSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNuRCxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDekQsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksZUFBZSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN2RCxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxhQUFhLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ25ELENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN6RCxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxjQUFjLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3JELENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksbUJBQW1CLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQy9ELENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDbEQsU0FBQSxDQUFDLENBQUM7QUFFSCxRQUFBLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO0FBQ3JDLFFBQUEsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBeUM7QUFDcEUsWUFBQSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbEUsWUFBQSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDaEUsWUFBQSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEUsWUFBQSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzVFLFlBQUEsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2pFLFlBQUEsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hFLFlBQUEsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3RFLFlBQUEsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzlELFlBQUEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDO0FBQ3hDLFlBQUEsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDO0FBQzFDLFNBQUEsQ0FBQyxDQUFDO0FBRUgsUUFBQSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxHQUFHLENBQWlDO0FBQy9ELFlBQUEsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakUsWUFBQSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN2RSxZQUFBLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3JFLFlBQUEsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDdkUsWUFBQSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNuRSxZQUFBLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pFLFlBQUEsQ0FBQyxRQUFRLENBQUMsNkJBQTZCLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDN0UsWUFBQSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzdFLFlBQUEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDL0QsWUFBQTtBQUNFLGdCQUFBLFFBQVEsQ0FBQyxtQ0FBbUM7QUFDNUMsZ0JBQUEsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7QUFDMUMsYUFBQTtBQUNGLFNBQUEsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHVCQUF1QixHQUFHQyxpQkFBUSxDQUNyQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDOUIsUUFBUSxDQUFDLDJCQUEyQixFQUNwQyxJQUFJLENBQ0wsQ0FBQztRQUVGLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNkO0lBRUQsTUFBTSxHQUFBO0FBQ0osUUFBQSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNwQyxRQUFBLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBRXZCLFFBQUEsSUFBSSxRQUFRLENBQUMsWUFBWSxFQUFFLHVCQUF1QixFQUFFO1lBQ2xELE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ3JGO0tBQ0Y7SUFFRCxPQUFPLEdBQUE7QUFDTCxRQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztLQUM5QjtBQUVELElBQUEsa0JBQWtCLENBQ2hCLElBQVUsRUFDVixPQUErQixFQUMvQixXQUF5QixFQUFBO1FBRXpCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNiLFFBQUEsT0FBTyxFQUFFLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUU1QixRQUFBLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDMUIsWUFBQSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzNFLFlBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7U0FDbEU7QUFFRCxRQUFBLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDN0IsWUFBQSxJQUNFLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQywrQkFBK0I7QUFDM0UsaUJBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsQ0FBQyxFQUMzRTtBQUNBLGdCQUFBLE1BQU0sUUFBUSxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNDLGdCQUFBLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUNyQztTQUNGO0tBQ0Y7QUFFRCxJQUFBLHNDQUFzQyxDQUFDLE9BQXlCLEVBQUE7QUFDOUQsUUFBQSxNQUFNLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQztBQUN4QyxRQUFBLE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDO0FBRTFELFFBQUEsSUFBSSxTQUFTLElBQUksU0FBUyxLQUFLLGNBQWMsRUFBRTtBQUM3QyxZQUFBLE9BQU8sQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDOzs7QUFHMUIsWUFBQSxNQUFNLFlBQVksR0FBRyxjQUFjLEdBQUcsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDaEUsT0FBTyxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQy9EO2FBQU0sSUFBSSxjQUFjLEtBQUssSUFBSSxJQUFJLGNBQWMsS0FBSyxFQUFFLEVBQUU7O0FBRTNELFlBQUEsT0FBTyxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUM7O0FBRy9CLFlBQUEsV0FBVyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7U0FDbkM7OztBQUlELFFBQUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7S0FDdkI7QUFFRCxJQUFBLGlCQUFpQixDQUNmLEtBQWEsRUFDYixPQUErQixFQUMvQixLQUFtQixFQUFBO1FBRW5CLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNqRCxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7O0FBR3BCLFFBQUEsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUd0QyxRQUFBLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3RCxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDNUQsUUFBQSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDcEYsUUFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUUzQixRQUFBLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUM7QUFDM0IsUUFBQSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUM7QUFFdEMsUUFBQSxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNyRixJQUFJLENBQUMsNEJBQTRCLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztBQUV6RCxRQUFBLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDMUIsWUFBQSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsWUFBWSxJQUFJLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFOztnQkFFL0UsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDekQ7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2hEO1lBRUQsT0FBTyxHQUFHLElBQUksQ0FBQztTQUNoQjtBQUVELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7QUFFRDs7Ozs7O0FBTUc7QUFDSCxJQUFBLDRCQUE0QixDQUMxQixLQUFtQixFQUNuQixJQUFVLEVBQ1YsTUFBNEIsRUFBQTtBQUU1QixRQUFBLElBQUksQ0FBQ1QsaUJBQVEsQ0FBQyxRQUFRLEVBQUU7WUFDdEIsT0FBTztTQUNSO0FBRUQsUUFBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFzQixDQUFDO1FBRWpELEtBQUssQ0FBQyxrQkFBa0IsR0FBRyxNQUFNLENBQUMsNkJBQTZCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25GLFFBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRTs7OztBQUk3QixZQUFBLEtBQUssQ0FBQyxjQUFjLEVBQUUsTUFBTSxFQUFFLENBQUM7U0FDaEM7S0FDRjtJQUVELG9CQUFvQixDQUNsQixTQUFvQixFQUNwQixPQUErQixFQUMvQixLQUFtQixFQUNuQixRQUE0QixFQUM1QixRQUE4QixFQUM5QixVQUF5QixFQUFBO0FBRXpCLFFBQUEsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUMzQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sU0FBUyxHQUFHLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7QUFFL0QsUUFBQSxNQUFNLG1CQUFtQixHQUFHLENBQUMsTUFBZSxFQUFFLE9BQWdCLEtBQUk7WUFDaEUsSUFBSSxPQUFPLEVBQUU7O0FBRVgsZ0JBQUEsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDO2dCQUMxRCxPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzNDO2lCQUFNOztBQUVMLGdCQUFBLE9BQU8sQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3BEOztBQUdELFlBQUEsSUFBSSxDQUFDLG9CQUFvQixDQUN2QixTQUFTLEVBQ1QsT0FBTyxFQUNQLEtBQUssRUFDTCxRQUFRLEVBQ1IsUUFBUSxFQUNSLFVBQVUsQ0FDWCxDQUFDO1lBRUYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUcvQyxZQUFBLE9BQU8sS0FBSyxDQUFDO0FBQ2YsU0FBQyxDQUFDO0FBRUYsUUFBQSxNQUFNLFlBQVksR0FBaUI7WUFDakMsSUFBSTtZQUNKLFVBQVU7QUFDVixZQUFBLE1BQU0sRUFBRTtnQkFDTixTQUFTO2dCQUNULGFBQWEsRUFBRSxRQUFRLENBQUMsWUFBWTtBQUNwQyxnQkFBQSxhQUFhLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUM5QyxhQUFBO1NBQ0YsQ0FBQztBQUVGLFFBQUEsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQzVDO0lBRUQsZ0JBQWdCLENBQUMsSUFBbUIsRUFBRSxRQUFxQixFQUFBO1FBQ3pELE1BQU0sRUFDSixTQUFTLEVBQ1QsUUFBUSxFQUFFLEVBQUUsNkJBQTZCLEVBQUUsR0FDNUMsR0FBRyxJQUFJLENBQUM7QUFDVCxRQUFBLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUM7QUFDM0IsUUFBQSxNQUFNLGFBQWEsR0FBRyxJQUFJLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQztRQUNqRCxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDcEIsUUFBQSxNQUFNLHVCQUF1QixHQUFHLElBQUksR0FBRyxDQUFpQjtBQUN0RCxZQUFBLGNBQWMsQ0FBQyxVQUFVO0FBQ3pCLFlBQUEsY0FBYyxDQUFDLFFBQVE7QUFDeEIsU0FBQSxDQUFDLENBQUM7QUFFSCxRQUFBLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtZQUNqQixJQUFJLGFBQWEsRUFBRTs7Z0JBRWpCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzdDLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDO0FBRTlELGdCQUFBLGNBQWMsQ0FBQyw0QkFBNEIsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ2xFLE9BQU8sR0FBRyxJQUFJLENBQUM7YUFDaEI7U0FDRjthQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2xELElBQUksNkJBQTZCLElBQUksYUFBYSxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTs7O2dCQUcxRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUV0QyxJQUFJLE9BQU8sRUFBRTtBQUNYLG9CQUFBLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7OztBQUd6Qix3QkFBQSxPQUE2QixDQUFDLGtDQUFrQyxDQUMvRCxTQUFTLEVBQ1QsSUFBa0MsQ0FDbkMsQ0FBQztxQkFDSDtvQkFFRCxPQUFPLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztpQkFDcEQ7YUFDRjtTQUNGO0FBRUQsUUFBQSxPQUFPLE9BQU8sQ0FBQztLQUNoQjtJQUVELGtCQUFrQixDQUFDLElBQW1CLEVBQUUsR0FBK0IsRUFBQTtRQUNyRSxNQUFNLEVBQ0osU0FBUyxFQUNULFFBQVEsRUFBRSxFQUFFLDZCQUE2QixFQUFFLEdBQzVDLEdBQUcsSUFBSSxDQUFDO0FBQ1QsUUFBQSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDO0FBQzNCLFFBQUEsTUFBTSxhQUFhLEdBQUcsSUFBSSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDakQsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFFBQUEsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLEdBQUcsQ0FBaUI7QUFDdEQsWUFBQSxjQUFjLENBQUMsVUFBVTtBQUN6QixZQUFBLGNBQWMsQ0FBQyxRQUFRO0FBQ3hCLFNBQUEsQ0FBQyxDQUFDO0FBRUgsUUFBQSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDakIsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFOzs7Z0JBRzNDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3RDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLHVCQUF1QixDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUM5RDtTQUNGO2FBQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbEQsSUFBSSw2QkFBNkIsSUFBSSxhQUFhLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFOzs7O2dCQUkxRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUV0QyxJQUFJLE9BQU8sRUFBRTtvQkFDWCxPQUFPLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDakQ7YUFDRjtTQUNGO0FBRUQsUUFBQSxPQUFPLE9BQU8sQ0FBQztLQUNoQjtBQUVELElBQUEsZ0JBQWdCLENBQ2QsS0FBYSxFQUNiLFVBQXlCLEVBQ3pCLFVBQXlCLEVBQ3pCLFdBQXlCLEVBQUE7QUFFekIsUUFBQSxNQUFNLEtBQUssR0FBRyxLQUFLLElBQUksRUFBRSxDQUFDO0FBQzFCLFFBQUEsTUFBTSxJQUFJLEdBQUcsSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDOUQsUUFBQSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFaEMsUUFBQSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNkO0FBRUQsUUFBQSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRXpFLFFBQUEsT0FBTyxJQUFJLENBQUM7S0FDYjtBQUVELElBQUEsY0FBYyxDQUNaLFNBQW9CLEVBQ3BCLE9BQStCLEVBQy9CLEtBQW1CLEVBQUE7QUFFbkIsUUFBQSxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRTNCLFFBQUEsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLFNBQVMsQ0FBQztBQUMzQixRQUFBLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBRXBFLFFBQUEsTUFBTSxjQUFjLEdBQUcsQ0FBQyxLQUFzQixLQUFJO0FBQ2hELFlBQUEsSUFBSSxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQ2pCLGdCQUFBLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUIsZ0JBQUEsV0FBVyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNoRDtpQkFBTTtBQUNMLGdCQUFBLElBQ0UsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7b0JBQ3ZDLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUN6QztvQkFDQSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7aUJBQ3hCO3FCQUFNO0FBQ0wsb0JBQUEsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDOUI7YUFDRjtBQUNILFNBQUMsQ0FBQztBQUVGLFFBQUEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQzlCLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUM3QjthQUFNO0FBQ0wsWUFBQSxXQUFXLENBQUMsSUFBSSxDQUNkLENBQUMsTUFBTSxLQUFJO2dCQUNULGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6QixhQUFDLEVBQ0QsQ0FBQyxNQUFNLEtBQUk7QUFDVCxnQkFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLHVEQUF1RCxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQy9FLGFBQUMsQ0FDRixDQUFDO1NBQ0g7S0FDRjtBQUVELElBQUEsZ0NBQWdDLENBQzlCLFNBQW9CLEVBQ3BCLGFBQXFCLEVBQ3JCLE1BQWMsRUFBQTtRQUVkLE1BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQy9ELElBQUksTUFBTSxDQUFDLENBQU0sR0FBQSxFQUFBLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBTyxJQUFBLEVBQUEsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBLENBQUEsQ0FBRyxDQUFDLEVBQzNFLE1BQU0sQ0FDUCxDQUFDO0FBRUYsUUFBQSxTQUFTLENBQUMsdUJBQXVCLEdBQUcsZUFBZSxDQUFDO0FBQ3BELFFBQUEsT0FBTyxlQUFlLENBQUM7S0FDeEI7QUFFRCxJQUFBLHNCQUFzQixDQUNwQixTQUFvQixFQUNwQixVQUF5QixFQUN6QixVQUF5QixFQUN6QixNQUE0QixFQUFBO1FBRTVCLElBQUksTUFBTSxHQUFXLElBQUksQ0FBQztRQUMxQixJQUFJLE9BQU8sR0FBMkIsSUFBSSxDQUFDO0FBRTNDLFFBQUEsTUFBTSxnQkFBZ0IsR0FBRztBQUN2QixZQUFBLE1BQU0sQ0FBQyw2QkFBNkI7QUFDcEMsWUFBQSxNQUFNLENBQUMsbUNBQW1DO1NBQzNDLENBQUM7QUFFRixRQUFBLE1BQU0sVUFBVSxHQUFHO0FBQ2pCLFlBQUEsTUFBTSxDQUFDLGlCQUFpQjtBQUN4QixZQUFBLE1BQU0sQ0FBQyxvQkFBb0I7QUFDM0IsWUFBQSxNQUFNLENBQUMsbUJBQW1CO0FBQzFCLFlBQUEsTUFBTSxDQUFDLG9CQUFvQjtBQUMzQixZQUFBLE1BQU0sQ0FBQyxrQkFBa0I7QUFDekIsWUFBQSxNQUFNLENBQUMsZ0JBQWdCO0FBQ3hCLFNBQUE7YUFDRSxNQUFNLENBQUMsZ0JBQWdCLENBQUM7QUFDeEIsYUFBQSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBTSxHQUFBLEVBQUEsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUEsQ0FBRyxDQUFDOztBQUVwQyxhQUFBLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBR3ZDLFFBQUEsTUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQ3RCLENBQUEsS0FBQSxFQUFRLFlBQVksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQU8sSUFBQSxFQUFBLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQSxDQUFHLENBQ3pFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUU1QixJQUFJLEtBQUssRUFBRTtZQUNULE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDM0MsWUFBQSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxCLElBQUksZ0JBQWdCLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDL0UsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNmO2lCQUFNO0FBQ0wsZ0JBQUEsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbkM7U0FDRjtBQUVELFFBQUEsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUM5QyxTQUFTLEVBQ1QsTUFBTSxFQUNOLFVBQVUsRUFDVixVQUFVLEVBQ1YsTUFBTSxDQUNQLENBQUM7QUFFRixRQUFBLElBQUksQ0FBQyxXQUFXLElBQUksT0FBTyxFQUFFO1lBQzNCLFNBQVMsQ0FBQyxXQUFXLENBQUMsdUJBQXVCLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRWxGLFlBQUEsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUUsWUFBQSxPQUFPLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDckY7S0FDRjtJQUVELHVCQUF1QixDQUNyQixTQUFvQixFQUNwQixlQUF1QixFQUN2QixVQUF5QixFQUN6QixVQUF5QixFQUN6QixNQUE0QixFQUFBO1FBRTVCLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixNQUFNLGlCQUFpQixHQUE2QixFQUFFLENBQUM7QUFDdkQsUUFBQSxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsdUJBQXVCLENBQUM7O0FBR3JELFFBQUEsTUFBTSxjQUFjLEdBQUc7QUFDckIsWUFBQSxNQUFNLENBQUMsaUJBQWlCO0FBQ3hCLFlBQUEsTUFBTSxDQUFDLG1CQUFtQjtBQUMxQixZQUFBLE1BQU0sQ0FBQyxvQkFBb0I7U0FDNUIsQ0FBQzs7UUFHRixJQUFJLENBQUMsZUFBZSxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDaEUsSUFBSSxLQUFLLEdBQW9CLElBQUksQ0FBQztZQUVsQyxNQUFNLFdBQVcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsdUJBQXVCLENBQUM7QUFDM0UsaUJBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQU0sR0FBQSxFQUFBLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFBLENBQUcsQ0FBQztBQUNwQyxpQkFBQSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXZDLE1BQU0sRUFBRSxHQUFHLElBQUksTUFBTSxDQUNuQixDQUFPLElBQUEsRUFBQSxZQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFPLElBQUEsRUFBQSxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFHLENBQUEsQ0FBQSxFQUN4RSxHQUFHLENBQ0osQ0FBQztBQUVGLFlBQUEsT0FBTyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksRUFBRTtnQkFDN0MsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUMzQyxnQkFBQSxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXhCLElBQUksZ0JBQWdCLEVBQUU7b0JBQ3BCLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztpQkFDaEY7cUJBQU07b0JBQ0wsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2xELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBRXhDLElBQUksT0FBTyxFQUFFO0FBQ1gsd0JBQUEsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FDakMsU0FBUyxFQUNULEtBQUssQ0FBQyxLQUFLLEVBQ1gsVUFBVSxFQUNWLFVBQVUsRUFDVixVQUFVLENBQ1gsQ0FBQztBQUVGLHdCQUFBLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQzs7QUFHakMsd0JBQUEsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxPQUFPLENBQUMsQ0FBQztBQUN6RSx3QkFBQSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQztxQkFDdEM7b0JBRUQsTUFBTTtpQkFDUDthQUNGO1NBQ0Y7OztBQUlELFFBQUEsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUMvRSxRQUFBLE9BQU8sV0FBVyxDQUFDO0tBQ3BCO0FBRU8sSUFBQSxPQUFPLG1CQUFtQixDQUFDLElBQVUsRUFBRSxPQUErQixFQUFBOztBQUU1RSxRQUFBLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDNUIsWUFBQSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTTtpQkFDekIsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUE0QixrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzRCxpQkFBQSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUV2QyxZQUFBLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ2hCLGdCQUFBLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLGdCQUFBLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNqRTtTQUNGO0tBQ0Y7SUFFTyxPQUFPLG1CQUFtQixDQUFDLE9BQStCLEVBQUE7UUFDaEUsSUFBSSxnQkFBZ0IsR0FBa0IsSUFBSSxDQUFDO0FBRTNDLFFBQUEsSUFBSSxPQUFPLEVBQUUsTUFBTSxFQUFFO1lBQ25CLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3pEO0FBRUQsUUFBQSxPQUFPLGdCQUFnQixDQUFDO0tBQ3pCO0lBRUQsS0FBSyxHQUFBO0FBQ0gsUUFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7QUFDakMsUUFBQSxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztLQUM3QjtBQUVELElBQUEsb0JBQW9CLENBQUMsUUFBbUMsRUFBQTtBQUN0RCxRQUFBLFFBQVEsR0FBRyxRQUFRLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDakQsUUFBQSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxLQUFLLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ2pEO0lBRUQsa0JBQWtCLEdBQUE7UUFDaEIsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlELFFBQUEsT0FBTyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNwRDtBQUVELElBQUEsb0JBQW9CLENBQUMsU0FBb0IsRUFBQTtRQUN2QyxJQUFJLFNBQVMsRUFBRTtBQUNiLFlBQUEsTUFBTSxXQUFXLEdBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFtQixDQUFDLFFBQVEsRUFBRSxDQUFDOztZQUduRixNQUFNLGtCQUFrQixHQUFHLFdBQVc7aUJBQ25DLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztpQkFDL0IsTUFBTSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDeEIsaUJBQUEsTUFBTSxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksS0FBSyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFTLENBQUMsQ0FBQzs7QUFHeEUsWUFBQSxNQUFNLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixFQUFFLEdBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FDbkMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFakIsWUFBQSxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsdUJBQXVCLENBQUM7WUFDaEQsS0FBSyxDQUFDLG1CQUFtQixHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2pELFlBQUEsS0FBSyxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDO0FBQzlDLFlBQUEsS0FBSyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7QUFDcEMsWUFBQSxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7QUFFMUMsWUFBQSxLQUFLLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUMvRCxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FDL0IsQ0FBQzs7WUFHRixNQUFNLFFBQVEsR0FDWixrQkFBa0IsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsQ0FBQztZQUN6RSxLQUFLLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDM0U7QUFFRCxRQUFBLE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0lBRUQsMkJBQTJCLENBQ3pCLFlBQTBCLEVBQzFCLG9CQUE4QixFQUFBO0FBRTlCLFFBQUEsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztBQUVsQyxRQUFBLElBQUk7QUFDRixZQUFBLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxDQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLG9CQUFvQixDQUFDLENBQUMsQ0FBQzs7QUFHNUUsWUFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLEVBQUUsR0FBRyxLQUFJO2dCQUNuRSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUN0QixvQkFBQSxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNyQjtBQUVELGdCQUFBLE9BQU8sVUFBVSxDQUFDO2FBQ25CLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDYjtRQUFDLE9BQU8sR0FBRyxFQUFFO0FBQ1osWUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLGdFQUFnRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3BGO0FBRUQsUUFBQSxPQUFPLE9BQU8sQ0FBQztLQUNoQjtBQUVELElBQUEsY0FBYyxDQUFDLFdBQXVCLEVBQUUsUUFBUSxHQUFHLEVBQUUsRUFBQTtBQUNuRCxRQUFBLFdBQVcsR0FBRyxXQUFXLElBQUksSUFBSSxHQUFHLEVBQVMsQ0FBQztBQUM5QyxRQUFBLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFTLENBQUM7QUFFckMsUUFBQSxJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUU7WUFDaEIsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3RDLFlBQUEsTUFBTSxlQUFlLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQztBQUMvQyxnQkFBQSxZQUFZLEVBQUUsSUFBSTtBQUNsQixnQkFBQSxVQUFVLEVBQUUsSUFBSTtBQUNoQixnQkFBQSx1QkFBdUIsRUFBRSxJQUFJO0FBQzdCLGdCQUFBLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixRQUFRO0FBQ1QsYUFBQSxDQUFDLENBQUM7QUFFSCxZQUFBLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUk7Z0JBQ2hDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUUvQyxnQkFBQSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDM0Msb0JBQUEsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDdkI7QUFDSCxhQUFDLENBQUMsQ0FBQztTQUNKO0FBRUQsUUFBQSxPQUFPLFdBQVcsQ0FBQztLQUNwQjtBQUVELElBQUEsd0JBQXdCLENBQUMsS0FBYSxFQUFBO1FBQ3BDLE1BQU0sRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3pELElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztRQUV2QixJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLHVCQUF1QixFQUFFLE1BQU0sRUFBRTtZQUM3RCxVQUFVLEdBQUcsdUJBQXVCLENBQUM7U0FDdEM7QUFFRCxRQUFBLE9BQU8sVUFBVSxDQUFDO0tBQ25CO0FBRU8sSUFBQSxVQUFVLENBQ2hCLElBQXFELEVBQUE7QUFFckQsUUFBQSxJQUFJLE9BQStCLENBQUM7UUFDcEMsTUFBTSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFFbkUsUUFBQSxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtBQUM1QixZQUFBLE9BQU8sR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3BDO0FBQU0sYUFBQSxJQUFJLFFBQVEsQ0FBZ0IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQ2hELE9BQU8sR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QztBQUFNLGFBQUEsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDbkMsWUFBQSxPQUFPLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZDO0FBRUQsUUFBQSxPQUFPLE9BQU8sQ0FBQztLQUNoQjtBQUNGOztNQzFyQlksa0JBQWtCLENBQUE7QUFtQjdCLElBQUEsSUFBSSxNQUFNLEdBQUE7UUFDUixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDckI7SUFFRCxJQUFJLE1BQU0sQ0FBQyxLQUFjLEVBQUE7QUFDdkIsUUFBQSxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztLQUN0QjtJQUVELFdBQ1MsQ0FBQSxHQUFRLEVBQ0MsS0FBWSxFQUNwQixPQUErQixFQUMvQixLQUFtQixFQUNuQixNQUE0QixFQUFBO1FBSjdCLElBQUcsQ0FBQSxHQUFBLEdBQUgsR0FBRyxDQUFLO1FBQ0MsSUFBSyxDQUFBLEtBQUEsR0FBTCxLQUFLLENBQU87UUFDcEIsSUFBTyxDQUFBLE9BQUEsR0FBUCxPQUFPLENBQXdCO1FBQy9CLElBQUssQ0FBQSxLQUFBLEdBQUwsS0FBSyxDQUFjO1FBQ25CLElBQU0sQ0FBQSxNQUFBLEdBQU4sTUFBTSxDQUFzQjtRQS9CN0IsSUFBZ0IsQ0FBQSxnQkFBQSxHQUFpQixFQUFFLENBQUM7UUFDcEMsSUFBYyxDQUFBLGNBQUEsR0FBdUIsRUFBRSxDQUFDO1FBRWhDLElBQXFCLENBQUEscUJBQUEsR0FBeUIsRUFBRSxDQUFDO0FBRXpELFFBQUEsSUFBQSxDQUFBLG9CQUFvQixHQUFHLElBQUksR0FBRyxFQUF1QyxDQUFDO1FBRXRFLElBQWEsQ0FBQSxhQUFBLEdBQStDLEVBQUUsQ0FBQztRQUMvRCxJQUF3QixDQUFBLHdCQUFBLEdBQXVCLEVBQUUsQ0FBQztRQUMzRCxJQUFNLENBQUEsTUFBQSxHQUFhLE1BQU0sQ0FBQztBQUMxQixRQUFBLElBQUEsQ0FBQSx3QkFBd0IsR0FBNkI7QUFDbkQsWUFBQSxHQUFHLEVBQUUsTUFBTTtBQUNYLFlBQUEsSUFBSSxFQUFFLE1BQU07QUFDWixZQUFBLElBQUksRUFBRSxLQUFLO0FBQ1gsWUFBQSxHQUFHLEVBQUUsS0FBSztBQUNWLFlBQUEsS0FBSyxFQUFFLE9BQU87U0FDZixDQUFDO0FBaUJBLFFBQUEsSUFBSUEsaUJBQVEsQ0FBQyxPQUFPLEVBQUU7QUFDcEIsWUFBQSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLENBQUMsd0JBQXdCLEdBQUc7QUFDOUIsZ0JBQUEsR0FBRyxFQUFFLEdBQUc7QUFDUixnQkFBQSxJQUFJLEVBQUUsR0FBRztBQUNULGdCQUFBLElBQUksRUFBRSxHQUFHO0FBQ1QsZ0JBQUEsR0FBRyxFQUFFLEdBQUc7QUFDUixnQkFBQSxLQUFLLEVBQUUsR0FBRzthQUNYLENBQUM7U0FDSDtRQUVELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNwQixRQUFBLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDOUQsUUFBQSxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEMsUUFBQSxJQUFJLENBQUMsOEJBQThCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBRW5ELFFBQUEsSUFBSSxDQUFDLHNCQUFzQjtBQUN6QixZQUFBLEtBQUssQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFjLHNCQUFzQixDQUFDLENBQUM7S0FDcEU7SUFFRCxZQUFZLEdBQUE7QUFDVixRQUFBLE1BQU0sb0JBQW9CLEdBQUc7QUFDM0IsWUFBQSxJQUFJLENBQUMsVUFBVTtBQUNmLFlBQUEsSUFBSSxDQUFDLFlBQVk7QUFDakIsWUFBQSxJQUFJLENBQUMsZ0JBQWdCO0FBQ3JCLFlBQUEsSUFBSSxDQUFDLGFBQWE7QUFDbEIsWUFBQSxJQUFJLENBQUMsVUFBVTtTQUNoQixDQUFDOzs7O1FBS0YsTUFBTSxnQkFBZ0IsR0FBaUIsRUFBRSxDQUFDOzs7O0FBSzFDLFFBQUEsTUFBTSxjQUFjLEdBQXVCO0FBQ3pDLFlBQUE7QUFDRSxnQkFBQSxpQkFBaUIsRUFBRSxJQUFJO0FBQ3ZCLGdCQUFBLEtBQUssRUFBRSxvQkFBb0I7QUFDM0IsZ0JBQUEsU0FBUyxFQUFFLElBQUk7QUFDZixnQkFBQSxHQUFHLEVBQUUsSUFBSTtBQUNULGdCQUFBLElBQUksRUFBRSxJQUFJO2dCQUNWLE9BQU8sRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLENBQUM7QUFDN0MsZ0JBQUEsT0FBTyxFQUFFLGlCQUFpQjtBQUMzQixhQUFBO0FBQ0QsWUFBQTtBQUNFLGdCQUFBLGlCQUFpQixFQUFFLElBQUk7QUFDdkIsZ0JBQUEsS0FBSyxFQUFFLG9CQUFvQjtnQkFDM0IsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNO0FBQ3RCLGdCQUFBLEdBQUcsRUFBRSxJQUFJO0FBQ1QsZ0JBQUEsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsT0FBTyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQztBQUM5QyxnQkFBQSxPQUFPLEVBQUUsbUJBQW1CO0FBQzdCLGFBQUE7QUFDRCxZQUFBO0FBQ0UsZ0JBQUEsaUJBQWlCLEVBQUUsSUFBSTtBQUN2QixnQkFBQSxLQUFLLEVBQUUsb0JBQW9CO0FBQzNCLGdCQUFBLFNBQVMsRUFBRSxDQUFBLEVBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBUSxNQUFBLENBQUE7QUFDakMsZ0JBQUEsR0FBRyxFQUFFLElBQUk7QUFDVCxnQkFBQSxJQUFJLEVBQUUsSUFBSTtBQUNWLGdCQUFBLE9BQU8sRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQ3ZELGdCQUFBLE9BQU8sRUFBRSxZQUFZO0FBQ3RCLGFBQUE7QUFDRCxZQUFBO0FBQ0UsZ0JBQUEsaUJBQWlCLEVBQUUsSUFBSTtBQUN2QixnQkFBQSxLQUFLLEVBQUUsb0JBQW9CO2dCQUMzQixTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU07QUFDdEIsZ0JBQUEsR0FBRyxFQUFFLEdBQUc7QUFDUixnQkFBQSxJQUFJLEVBQUUsSUFBSTtnQkFDVixPQUFPLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxDQUFDO0FBQzdDLGdCQUFBLE9BQU8sRUFBRSxvQkFBb0I7QUFDOUIsYUFBQTtBQUNELFlBQUE7QUFDRSxnQkFBQSxpQkFBaUIsRUFBRSxJQUFJO0FBQ3ZCLGdCQUFBLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDekIsZ0JBQUEsU0FBUyxFQUFFLElBQUk7QUFDZixnQkFBQSxHQUFHLEVBQUUsSUFBSTtBQUNULGdCQUFBLElBQUksRUFBRSxJQUFJO0FBQ1YsZ0JBQUEsT0FBTyxFQUFFLENBQUcsQ0FBQSxDQUFBO0FBQ1osZ0JBQUEsT0FBTyxFQUFFLGlCQUFpQjtBQUMzQixhQUFBO0FBQ0QsWUFBQTtBQUNFLGdCQUFBLGlCQUFpQixFQUFFLElBQUk7QUFDdkIsZ0JBQUEsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUMzQixnQkFBQSxTQUFTLEVBQUUsSUFBSTtBQUNmLGdCQUFBLEdBQUcsRUFBRSxJQUFJO0FBQ1QsZ0JBQUEsSUFBSSxFQUFFLElBQUk7QUFDVixnQkFBQSxPQUFPLEVBQUUsQ0FBRyxDQUFBLENBQUE7QUFDWixnQkFBQSxPQUFPLEVBQUUsZ0JBQWdCO0FBQzFCLGFBQUE7U0FDRixDQUFDO1FBRUYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLGdCQUFnQixDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQztLQUM3QztJQUVELDBCQUEwQixDQUFDLEtBQVksRUFBRSxNQUE0QixFQUFBO0FBQ25FLFFBQUEsSUFBSSxNQUFNLEVBQUUsdUJBQXVCLEVBQUU7OztZQUduQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDNUIsQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsS0FBSyxTQUFTLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxLQUFLLENBQzVELENBQUM7QUFFRixZQUFBLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDMUI7S0FDRjtJQUVELDBCQUEwQixDQUFDLEtBQVksRUFBRSxTQUErQixFQUFBO0FBQ3RFLFFBQUEsTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFjLEVBQUUsTUFBZSxLQUFJO1lBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsS0FBSTtBQUNsQyxnQkFBQSxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFJO0FBQzNDLG9CQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2hDLG9CQUFBLE9BQU8sS0FBSyxDQUFDO0FBQ2YsaUJBQUMsQ0FBQyxDQUFDO0FBQ0wsYUFBQyxDQUFDLENBQUM7QUFDTCxTQUFDLENBQUM7UUFFRixPQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDekMsT0FBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLElBQUksRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzNDO0lBRUQsb0JBQW9CLENBQUMsS0FBWSxFQUFFLFlBQTBCLEVBQUE7QUFDM0QsUUFBQSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLFlBQVksQ0FBQztBQUV0QyxRQUFBLElBQUksTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7WUFDN0IsTUFBTSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLEdBQUcsTUFBTSxDQUFDO1lBQzNELE1BQU0sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsR0FBRyxhQUFhLENBQUM7WUFDdkUsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFDekIsWUFBQSxJQUFJLFVBQThCLENBQUM7WUFFbkMsTUFBTSxVQUFVLEdBQUcsQ0FDakIsT0FBbUIsRUFDbkIsR0FBVyxFQUNYLGNBQXVCLEVBQ3ZCLE9BQWdCLEtBQ2Q7QUFDRixnQkFBQSxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGFBQWEsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNwRixhQUFDLENBQUM7O0FBR0YsWUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN6QyxnQkFBQSxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsZ0JBQUEsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUM7QUFDcEQsZ0JBQUEsSUFBSSxHQUFXLENBQUM7QUFFaEIsZ0JBQUEsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRTs7QUFFckIsb0JBQUEsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7aUJBQ2pCO0FBQU0scUJBQUEsSUFBSSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFOztBQUU1QyxvQkFBQSxHQUFHLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDaEMsb0JBQUEsRUFBRSxnQkFBZ0IsQ0FBQztpQkFDcEI7cUJBQU07O0FBRUwsb0JBQUEsT0FBTyxDQUFDLEdBQUcsQ0FDVCxDQUFBLGlEQUFBLEVBQW9ELEtBQUssQ0FBQyxLQUFLLENBQWEsVUFBQSxFQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQSx1Q0FBQSxDQUF5QyxDQUNoSSxDQUFDO29CQUNGLFNBQVM7aUJBQ1Y7QUFFRCxnQkFBQSxVQUFVLEdBQUcsVUFBVSxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM3RCxnQkFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztvQkFDdEIsS0FBSztBQUNMLG9CQUFBLE9BQU8sRUFBRSxHQUFHO29CQUNaLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSztBQUNwQixvQkFBQSxHQUFHLFVBQVU7QUFDZCxpQkFBQSxDQUFDLENBQUM7YUFDSjs7QUFHRCxZQUFBLFVBQVUsR0FBRyxVQUFVLENBQUMsY0FBYyxJQUFJLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2hGLFlBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7QUFDdEIsZ0JBQUEsS0FBSyxFQUFFLElBQUk7QUFDWCxnQkFBQSxPQUFPLEVBQUUsUUFBUTtBQUNqQixnQkFBQSxPQUFPLEVBQUUsWUFBWTtBQUNyQixnQkFBQSxHQUFHLFVBQVU7QUFDZCxhQUFBLENBQUMsQ0FBQztTQUNKO0tBQ0Y7QUFFRCxJQUFBLHlCQUF5QixDQUFDLEtBQVksRUFBQTtBQUNwQyxRQUFBLE1BQU0sSUFBSSxHQUEyQjtBQUNuQyxZQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQztBQUM5QixZQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLENBQUM7QUFFRixRQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUk7WUFDakIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDOUQsU0FBQyxDQUFDLENBQUM7S0FDSjtJQUVELDhCQUE4QixDQUFDLEtBQVksRUFBRSxNQUE0QixFQUFBO0FBQ3ZFLFFBQUEsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDO1FBRTFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsS0FBSTtBQUN0QyxZQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDcEUsU0FBQyxDQUFDLENBQUM7S0FDSjtBQUVELElBQUEsNkJBQTZCLENBQzNCLElBQVUsRUFDVixZQUEyQixFQUMzQixjQUFrQyxFQUNsQyxZQUE4QixFQUFBO1FBRTlCLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLHFCQUFxQixFQUFFLEdBQUcsWUFBWSxDQUFDO1FBQ2xFLElBQUksT0FBTyxHQUFxQixJQUFJLENBQUM7UUFFckMsSUFBSSxTQUFTLEVBQUU7QUFDYixZQUFBLE1BQU0sYUFBYSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3RSxNQUFNLGNBQWMsR0FBRyxZQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDO0FBRXpELFlBQUEsTUFBTSxVQUFVLEdBQ2QsQ0FBQyxjQUFjLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDO0FBQ2xFLGdCQUFBLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFL0IsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNmLGdCQUFBLE9BQU8sR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUVuRSxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNaLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQztBQUMzQyxvQkFBQSxPQUFPLEdBQUc7QUFDUix3QkFBQSxpQkFBaUIsRUFBRSxLQUFLO0FBQ3hCLHdCQUFBLEtBQUssRUFBRSxFQUFFO0FBQ1Qsd0JBQUEsSUFBSSxFQUFFLElBQUk7d0JBQ1YsT0FBTyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDO0FBQy9DLHdCQUFBLFNBQVMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQzt3QkFDOUIsR0FBRzt3QkFDSCxPQUFPO3FCQUNSLENBQUM7QUFFRixvQkFBQSxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUM5Qjs7QUFHRCxnQkFBQSxPQUFPLENBQUMsSUFBSSxHQUFHLE1BQUs7QUFDbEIsb0JBQUEsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7b0JBQ2hDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDZCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDcEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDOUQsb0JBQUEsT0FBTyxLQUFLLENBQUM7QUFDZixpQkFBQyxDQUFDO0FBRUYsZ0JBQUEsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3hCO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0FBRUQsSUFBQSxtQkFBbUIsQ0FBQyxZQUEwQixFQUFBO0FBQzVDLFFBQUEsTUFBTSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxZQUFZLENBQUM7UUFDMUMsTUFBTSxFQUNKLEtBQUssRUFDTCxLQUFLLEVBQ0wscUJBQXFCLEVBQ3JCLGdCQUFnQixFQUNoQixjQUFjLEVBQ2QsYUFBYSxFQUNiLE1BQU0sRUFBRSxFQUFFLGtCQUFrQixFQUFFLEdBQy9CLEdBQUcsSUFBSSxDQUFDO1FBRVQsSUFBSSxDQUFDLDZCQUE2QixDQUNoQyxJQUFJLEVBQ0osVUFBVSxFQUNWLGNBQWMsRUFDZCxrQkFBa0IsQ0FDbkIsQ0FBQztBQUVGLFFBQUEsTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3pFLFFBQUEsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7O0FBRzFDLFFBQUEsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDMUMsUUFBQSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUV6QixNQUFNLGVBQWUsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFFN0UsUUFBQSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQzFCLFlBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUscUJBQXFCLENBQUMsQ0FBQztBQUNoRCxZQUFBLHFCQUFxQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7OztBQUlqQyxZQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBRTFDLFlBQUEsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZDO2FBQU07WUFDTCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQUM7QUFDekUsWUFBQSxJQUFJLG1CQUFtQixDQUFDLE1BQU0sRUFBRTtBQUM5QixnQkFBQSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDO2FBQ3BEO0FBRUQsWUFBQSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxlQUFlLENBQUMsQ0FBQztBQUMxQyxZQUFBLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQ2pGO0tBQ0Y7SUFFRCxZQUFZLENBQUMsS0FBWSxFQUFFLE9BQTRDLEVBQUE7QUFDckUsUUFBQSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxLQUFJO1lBQ3pCLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBZSxDQUFDO0FBQzVELFlBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckQsU0FBQyxDQUFDLENBQUM7S0FDSjtJQUVELGNBQWMsQ0FBQyxLQUFZLEVBQUUsT0FBcUIsRUFBQTtBQUNoRCxRQUFBLE1BQU0sWUFBWSxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztRQUNsQyxNQUFNLE9BQU8sR0FBeUIsRUFBRSxDQUFDO0FBRXpDLFFBQUEsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIsT0FBTyxDQUFDLEVBQUUsRUFBRTtZQUNWLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sS0FBSTs7OztBQUlwRCxnQkFBQSxNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxTQUFTO3FCQUN2QyxLQUFLLENBQUMsR0FBRyxDQUFDO3FCQUNWLEdBQUcsQ0FBQyxDQUFDLFFBQVEsTUFBTSxRQUFRLEtBQUssS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUM7cUJBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUViLGdCQUFBLE9BQU8sZ0JBQWdCLEtBQUssTUFBTSxDQUFDLFNBQVMsSUFBSSxPQUFPLENBQUMsR0FBRyxLQUFLLE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDN0UsYUFBQyxDQUFDLENBQUM7QUFFSCxZQUFBLElBQUksVUFBVSxJQUFJLENBQUMsRUFBRTtBQUNuQixnQkFBQSxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3pCLGdCQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDckIsZ0JBQUEsWUFBWSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDcEM7U0FDRjtBQUVELFFBQUEsT0FBTyxPQUFPLENBQUM7S0FDaEI7SUFFRCwwQkFBMEIsR0FBQTtRQUN4QixJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxLQUFJO1lBQ3ZDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNkLFNBQUMsQ0FBQyxDQUFDO0tBQ0o7QUFFRCxJQUFBLDBCQUEwQixDQUFDLFVBQW1CLEVBQUE7QUFDNUMsUUFBQSxNQUFNLEVBQUUsc0JBQXNCLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDeEMsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDO1FBRTFCLElBQUksVUFBVSxFQUFFO1lBQ2QsWUFBWSxHQUFHLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztTQUNuQztRQUVELElBQUksc0JBQXNCLEVBQUU7QUFDMUIsWUFBQSxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQztTQUNyRDtLQUNGO0FBRUQsSUFBQSxzQkFBc0IsQ0FDcEIsS0FBbUIsRUFDbkIsWUFBMEIsRUFDMUIsVUFBOEIsRUFDOUIsYUFBeUQsRUFBQTtBQUV6RCxRQUFBLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDO0FBQ3RDLFFBQUEsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssQ0FBQztRQUMxQixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFFNUUsUUFBQSxJQUFJLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQzVFLFFBQUEsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNqRDtBQUVELElBQUEsdUJBQXVCLENBQ3JCLFFBQXFCLEVBQ3JCLGFBQWdDLEVBQ2hDLGFBQXlELEVBQUE7UUFFekQsSUFBSSxhQUFhLEVBQUUsTUFBTSxJQUFJLGFBQWEsQ0FBQywyQkFBMkIsRUFBRTtBQUN0RSxZQUFBLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxTQUFxQixLQUFJO2dCQUNsRCxPQUFPLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2pELGFBQUMsQ0FBQztZQUVGLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUU3RSxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUM1QixZQUFBLFFBQVEsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7QUFHMUMsWUFBQSxJQUFJLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNwRCxhQUFhLENBQUMsVUFBVSxDQUFDO0FBQ3ZCLGdCQUFBLEdBQUcsRUFBRSw0QkFBNEI7Z0JBQ2pDLElBQUksRUFBRSxhQUFhLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBRSxDQUFBO0FBQ2hFLGFBQUEsQ0FBQyxDQUFDOztBQUdILFlBQUEsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFlBQVksS0FBSTtnQkFDckMsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsWUFBWSxDQUFDO0FBQ2pELGdCQUFBLElBQUksU0FBcUIsQ0FBQztBQUMxQixnQkFBQSxJQUFJLEdBQVcsQ0FBQztnQkFDaEIsSUFBSSxTQUFTLEdBQWEsSUFBSSxDQUFDO2dCQUUvQixJQUFJLEtBQUssRUFBRTs7b0JBRVQsR0FBRyxHQUFHLE9BQU8sQ0FBQztBQUNkLG9CQUFBLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO0FBRTVCLG9CQUFBLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUNsQix3QkFBQSxTQUFTLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO3FCQUNuQztpQkFDRjtxQkFBTTs7QUFFTCxvQkFBQSxHQUFHLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQztBQUM3QixvQkFBQSxTQUFTLEdBQUcsYUFBYSxDQUFDLGNBQWMsQ0FBQztpQkFDMUM7OztnQkFJRCxNQUFNLGtCQUFrQixHQUFHLFNBQVM7c0JBQ2hDLElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUEsRUFBQSxFQUFLLEdBQUcsQ0FBRSxDQUFBO0FBQzVDLHNCQUFFLENBQUEsRUFBRyxHQUFHLENBQUEsQ0FBRSxDQUFDO0FBRWIsZ0JBQUEsYUFBYSxHQUFHLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNoRCxhQUFhLENBQUMsVUFBVSxDQUFDO0FBQ3ZCLG9CQUFBLEdBQUcsRUFBRSw0QkFBNEI7QUFDakMsb0JBQUEsSUFBSSxFQUFFLGtCQUFrQjtBQUN6QixpQkFBQSxDQUFDLENBQUM7Z0JBRUgsYUFBYSxDQUFDLFVBQVUsQ0FBQztBQUN2QixvQkFBQSxHQUFHLEVBQUUsU0FBUztBQUNkLG9CQUFBLElBQUksRUFBRSxPQUFPO0FBQ2QsaUJBQUEsQ0FBQyxDQUFDO0FBQ0wsYUFBQyxDQUFDLENBQUM7U0FDSjtLQUNGO0lBRUQsd0JBQXdCLENBQUMsUUFBcUIsRUFBRSxVQUE4QixFQUFBO1FBQzVFLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUU5RSxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUM3QixRQUFBLFFBQVEsQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUUzQyxRQUFBLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUk7QUFDNUIsWUFBQSxNQUFNLGFBQWEsR0FBRyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUV2RCxhQUFhLENBQUMsVUFBVSxDQUFDO0FBQ3ZCLGdCQUFBLEdBQUcsRUFBRSw0QkFBNEI7Z0JBQ2pDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTztBQUNyQixhQUFBLENBQUMsQ0FBQztZQUVILGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDckQsU0FBQyxDQUFDLENBQUM7S0FDSjtJQUVELHVCQUF1QixDQUNyQixJQUF5QixFQUN6QixRQUFxQixFQUFBO1FBRXJCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFN0MsSUFBSSxDQUFDLEVBQUUsRUFBRTs7QUFFUCxZQUFBLE1BQU0sR0FBRyxHQUFHO2dCQUNWLE1BQU0sRUFBRSxDQUFDLHlCQUF5QixDQUFDO2dCQUNuQyxNQUFNLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQzthQUMzQyxDQUFDO0FBRUYsWUFBQSxFQUFFLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN6QztBQUVELFFBQUEsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUVELDBCQUEwQixDQUFDLEdBQWEsRUFBRSxRQUFxQixFQUFBO0FBQzdELFFBQUEsTUFBTSxNQUFNLEdBQW1CO0FBQzdCLFlBQUEsR0FBRyxFQUFFLENBQUMscUJBQXFCLEVBQUUsR0FBRyxHQUFHLENBQUM7U0FDckMsQ0FBQztBQUVGLFFBQUEsT0FBTyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ25DO0lBRUQsaUJBQWlCLENBQUMsR0FBa0IsRUFBRSxJQUFtQixFQUFBO0FBQ3ZELFFBQUEsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFL0IsSUFBSSxNQUFNLENBQUMsMkJBQTJCLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRTtZQUMvRCxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZCxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDdEI7S0FDRjtJQUVELGVBQWUsQ0FBQyxHQUFrQixFQUFFLElBQW1CLEVBQUE7QUFDckQsUUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNuQztBQUVELElBQUEsc0JBQXNCLENBQ3BCLElBQW1CLEVBQ25CLFVBQXlCLEVBQ3pCLFlBQThCLEVBQUE7QUFFOUIsUUFBQSxNQUFNLEVBQ0osR0FBRyxFQUFFLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsR0FDdkMsR0FBRyxJQUFJLENBQUM7UUFFVCxNQUFNLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQ1UscUJBQVksQ0FBQyxDQUFDO0FBQ3ZFLFFBQUEsTUFBTSxnQkFBZ0IsR0FBRyxrQkFBa0IsRUFBRSxJQUFJLEtBQUssVUFBVSxDQUFDO0FBQ2pFLFFBQUEsTUFBTSxVQUFVLEdBQUcsa0JBQWtCLEVBQUUsSUFBSSxDQUFDO0FBRTVDLFFBQUEsSUFBSSxnQkFBZ0IsSUFBSSxVQUFVLEVBQUU7QUFDbEMsWUFBQSxNQUFNLE9BQU8sR0FBRyxvQkFBb0IsQ0FDbEMsV0FBVyxFQUNYLEtBQUssRUFDTCxJQUFJLEVBQ0osVUFBVSxDQUFDLElBQUksRUFDZixZQUFZLENBQ2IsQ0FBQztZQUVGLElBQUksT0FBTyxFQUFFO0FBQ1gsZ0JBQUEsa0JBQWtCLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3REO1NBQ0Y7S0FDRjtJQUVELGFBQWEsQ0FBQyxHQUFrQixFQUFFLE1BQWUsRUFBQTtBQUMvQyxRQUFBLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRWpDLElBQUksTUFBTSxFQUFFO0FBQ1YsWUFBQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDO0FBQ2pDLFlBQUEsS0FBSyxHQUFHLE1BQU0sR0FBRyxFQUFFLEtBQUssR0FBRyxFQUFFLEtBQUssQ0FBQztBQUNuQyxZQUFBLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3JDO0tBQ0Y7SUFFRCxpQkFBaUIsQ0FBQyxTQUFxQixFQUFFLEdBQVcsRUFBQTtRQUNsRCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFFcEIsUUFBQSxJQUFJLFNBQVMsSUFBSSxHQUFHLEVBQUU7QUFDcEIsWUFBQSxNQUFNLEVBQUUsd0JBQXdCLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFFMUMsTUFBTSxXQUFXLEdBQUcsU0FBUztBQUMxQixpQkFBQSxHQUFHLENBQUMsQ0FBQyxRQUFRLEtBQUk7QUFDaEIsZ0JBQUEsT0FBTyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxDQUFDO0FBQ2pFLGFBQUMsQ0FBQztpQkFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFYixZQUFBLFVBQVUsR0FBRyxDQUFHLEVBQUEsV0FBVyxDQUFJLENBQUEsRUFBQSxHQUFHLEVBQUUsQ0FBQztTQUN0QztBQUVELFFBQUEsT0FBTyxVQUFVLENBQUM7S0FDbkI7QUFDRjs7QUN4bEJlLFNBQUEsa0JBQWtCLENBQUMsR0FBUSxFQUFFLE1BQTBCLEVBQUE7QUFDckUsSUFBQSxNQUFNLG1CQUFtQixHQUFHLHlCQUF5QixDQUFDLEdBQUcsQ0FBQztBQUN4RCxVQUFFLGtCQUErQyxDQUFDO0lBRXBELElBQUksQ0FBQyxtQkFBbUIsRUFBRTtBQUN4QixRQUFBLE9BQU8sQ0FBQyxHQUFHLENBQ1QsK0dBQStHLENBQ2hILENBQUM7QUFDRixRQUFBLE9BQU8sSUFBSSxDQUFDO0tBQ2I7QUFFRCxJQUFBLE1BQU0saUJBQWlCLEdBQUcsY0FBYyxtQkFBbUIsQ0FBQTtRQUd6RCxXQUNFLENBQUEsR0FBUSxFQUNELE1BQTBCLEVBQUE7WUFFakMsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFGekMsSUFBTSxDQUFBLE1BQUEsR0FBTixNQUFNLENBQW9CO0FBSWpDLFlBQUEsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQztBQUMzQixZQUFBLE9BQU8sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztBQUMvQyxZQUFBLE1BQU0sUUFBUSxHQUFHLElBQUksa0JBQWtCLENBQ3JDLEdBQUcsRUFDSCxJQUFJLENBQUMsS0FBSyxFQUNWLElBQUksQ0FBQyxPQUFPLEVBQ1osSUFBSSxFQUNKLE9BQU8sQ0FDUixDQUFDO0FBQ0YsWUFBQSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksV0FBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDdkQ7UUFFRCxVQUFVLENBQUMsSUFBVSxFQUFFLFdBQXlCLEVBQUE7QUFDOUMsWUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ2hFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNkO1FBRUQsTUFBTSxHQUFBO0FBQ0osWUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3JCLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNoQjtRQUVELE9BQU8sR0FBQTtZQUNMLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNoQixZQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDdkI7UUFFUyxpQkFBaUIsR0FBQTtZQUN6QixNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDMUMsWUFBQSxNQUFNLENBQUMsc0NBQXNDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFdkQsWUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUMzRCxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzthQUMzQjtTQUNGO0FBRUQsUUFBQSxjQUFjLENBQUMsS0FBYSxFQUFBO1lBQzFCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUQsWUFBQSxPQUFPLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDcEM7UUFFRCxrQkFBa0IsQ0FBQyxJQUFtQixFQUFFLEdBQStCLEVBQUE7QUFDckUsWUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUU7QUFDOUMsZ0JBQUEsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzthQUNyQztTQUNGO1FBRUQsZ0JBQWdCLENBQUMsS0FBb0IsRUFBRSxRQUFxQixFQUFBO0FBQzFELFlBQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxFQUFFO0FBQ2xELGdCQUFBLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDekM7U0FDRjtLQUNGLENBQUM7QUFFRixJQUFBLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDNUM7O0FDeEZBOzs7Ozs7QUFNRztBQUNILFNBQVMsdUJBQXVCLENBQzlCLG9CQUE2QixFQUM3QixjQUFvQyxFQUNwQyxlQUEyQixFQUFBO0lBRTNCLElBQUksbUJBQW1CLEdBQWdCLElBQUksQ0FBQztJQUU1QyxJQUFJLG9CQUFvQixFQUFFOzs7Ozs7QUFNeEIsUUFBQSxtQkFBbUIsR0FBRyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFnQixDQUFDO1FBRTFFLElBQUksbUJBQW1CLEVBQUU7QUFDdkIsWUFBQSxNQUFNLEVBQUUsUUFBUSxFQUFFLDhCQUE4QixFQUFFLEdBQUcsY0FBYyxDQUFDO0FBRXBFLFlBQUEsbUJBQW1CLENBQUMsUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDM0QsWUFBQSxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFFL0QsWUFBQSxJQUFJLFFBQVEsRUFBRSxNQUFNLEVBQUU7O2dCQUVwQixNQUFNLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsOEJBQThCLENBQUMsQ0FBQztnQkFFakYsSUFBSSxNQUFNLEVBQUU7QUFDVixvQkFBQVQsZ0JBQU8sQ0FBQyxNQUFxQixFQUFFLFFBQVEsQ0FBQyxDQUFDO2lCQUMxQzthQUNGO1NBQ0Y7S0FDRjtBQUVELElBQUEsT0FBTyxtQkFBbUIsQ0FBQztBQUM3QixDQUFDO0FBQ0Q7Ozs7O0FBS0c7QUFDSCxTQUFTLHNDQUFzQyxDQUM3QyxZQUFxQixFQUNyQixXQUF3QixFQUFBO0lBRXhCLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztBQUV6QixJQUFBLElBQUksWUFBWSxJQUFJLFdBQVcsRUFBRTs7QUFFL0IsUUFBQSxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztBQUNqRCxRQUFBLFdBQVcsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUVuQyxJQUFJLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLEVBQUU7WUFDbEUsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3RCLFlBQVksR0FBRyxJQUFJLENBQUM7U0FDckI7QUFFRCxRQUFBLFdBQVcsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQztLQUM1QztBQUVELElBQUEsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQztBQUNEOzs7Ozs7QUFNRztBQUNILFNBQVMsNEJBQTRCLENBQ25DLEdBQVEsRUFDUixjQUFvQyxFQUFBO0lBRXBDLElBQUksb0JBQW9CLEdBQVksSUFBSSxDQUFDO0FBQ3pDLElBQUEsTUFBTSxXQUFXLEdBQUcsR0FBRyxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUM7SUFFbkQsSUFBSSxXQUFXLEVBQUU7QUFDZixRQUFBLG9CQUFvQixHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQzlDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsMEJBQTBCLENBQ3hFLENBQUM7UUFFRixJQUFJLENBQUMsb0JBQW9CLEVBQUU7O1lBRXpCLG9CQUFvQixHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQzlDLGNBQWMsQ0FBQywwQkFBMEIsQ0FDMUMsQ0FBQztTQUNIO0tBQ0Y7QUFFRCxJQUFBLE9BQU8sb0JBQW9CLENBQUM7QUFDOUIsQ0FBQztNQUVZLGNBQWMsQ0FBQTtBQVF6Qjs7Ozs7OztBQU9HO0FBQ0gsSUFBQSxPQUFPLDZCQUE2QixDQUNsQyxHQUFRLEVBQ1IsY0FBb0MsRUFDcEMsZUFBMkIsRUFBQTtRQUUzQixJQUFJLG1CQUFtQixHQUFnQixJQUFJLENBQUM7OztRQUk1QyxJQUNFLENBQUNELGlCQUFRLENBQUMsUUFBUTtZQUNsQixDQUFDLGNBQWMsQ0FBQyxTQUFTO1lBQ3pCLGNBQWMsQ0FBQywwQkFBMEIsRUFDekM7QUFDQSxZQUFBLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxNQUFNLG9CQUFvQixHQUFHLDRCQUE0QixDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUMvRSxJQUFJLG9CQUFvQixFQUFFO1lBQ3hCLE1BQU0sV0FBVyxHQUFHLHVCQUF1QixDQUN6QyxvQkFBb0IsRUFDcEIsY0FBYyxFQUNkLGVBQWUsQ0FDaEIsQ0FBQztBQUVGLFlBQUEsSUFBSSxzQ0FBc0MsQ0FBQyxvQkFBb0IsRUFBRSxXQUFXLENBQUMsRUFBRTtBQUM3RSxnQkFBQSxjQUFjLENBQUMsMEJBQTBCLEdBQUcsb0JBQW1DLENBQUM7QUFDaEYsZ0JBQUEsY0FBYyxDQUFDLHlCQUF5QixHQUFHLFdBQVcsQ0FBQztnQkFDdkQsbUJBQW1CLEdBQUcsV0FBVyxDQUFDO2FBQ25DO1NBQ0Y7QUFFRCxRQUFBLE9BQU8sbUJBQW1CLENBQUM7S0FDNUI7QUFDRDs7OztBQUlHO0FBQ0gsSUFBQSxPQUFPLDRCQUE0QixHQUFBO1FBQ2pDLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztBQUV6QixRQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsMEJBQTBCLEVBQUU7QUFDOUMsWUFBQSxPQUFPLFlBQVksQ0FBQztTQUNyQjtBQUVELFFBQUEsSUFBSSxjQUFjLENBQUMseUJBQXlCLEVBQUUsYUFBYSxFQUFFO0FBQzNELFlBQUEsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLHlCQUF5QixDQUFDO0FBQzdELFlBQUEsTUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDLDBCQUEwQixDQUFDO0FBRS9ELFlBQUEsTUFBTSxjQUFjLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7QUFDbEQsWUFBQSxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFFcEMsSUFBSSxXQUFXLENBQUMscUJBQXFCLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxFQUFFO2dCQUNsRSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFckIsZ0JBQUEsY0FBYyxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQztBQUNoRCxnQkFBQSxjQUFjLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDO2dCQUNqRCxZQUFZLEdBQUcsSUFBSSxDQUFDO2FBQ3JCO0FBRUQsWUFBQSxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUM7U0FDN0M7QUFFRCxRQUFBLE9BQU8sWUFBWSxDQUFDO0tBQ3JCO0FBQ0Y7O0FDektELE1BQU0sWUFBWSxHQUF3QjtBQUN4QyxJQUFBO0FBQ0UsUUFBQSxFQUFFLEVBQUUsb0JBQW9CO0FBQ3hCLFFBQUEsSUFBSSxFQUFFLHVCQUF1QjtRQUM3QixJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVE7QUFDbkIsUUFBQSxNQUFNLEVBQUUsb0JBQW9CO0FBQzVCLFFBQUEsWUFBWSxFQUFFLElBQUk7QUFDbkIsS0FBQTtBQUNELElBQUE7QUFDRSxRQUFBLEVBQUUsRUFBRSw0QkFBNEI7QUFDaEMsUUFBQSxJQUFJLEVBQUUscUJBQXFCO1FBQzNCLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVTtBQUNyQixRQUFBLE1BQU0sRUFBRSxrQkFBa0I7QUFDMUIsUUFBQSxZQUFZLEVBQUUsSUFBSTtBQUNuQixLQUFBO0FBQ0QsSUFBQTtBQUNFLFFBQUEsRUFBRSxFQUFFLDRCQUE0QjtBQUNoQyxRQUFBLElBQUksRUFBRSxnREFBZ0Q7UUFDdEQsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVO0FBQ3JCLFFBQUEsTUFBTSxFQUFFLG9CQUFvQjtBQUM1QixRQUFBLFlBQVksRUFBRSxJQUFJO0FBQ25CLEtBQUE7QUFDRCxJQUFBO0FBQ0UsUUFBQSxFQUFFLEVBQUUsbUNBQW1DO0FBQ3ZDLFFBQUEsSUFBSSxFQUFFLG9DQUFvQztRQUMxQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVU7QUFDckIsUUFBQSxNQUFNLEVBQUUsb0JBQW9CO0FBQzVCLFFBQUEsWUFBWSxFQUFFLElBQUk7QUFDbEIsUUFBQSxXQUFXLEVBQUUsRUFBRSx1QkFBdUIsRUFBRSxJQUFJLEVBQUU7QUFDL0MsS0FBQTtBQUNELElBQUE7QUFDRSxRQUFBLEVBQUUsRUFBRSwrQkFBK0I7QUFDbkMsUUFBQSxJQUFJLEVBQUUseUJBQXlCO1FBQy9CLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYTtBQUN4QixRQUFBLE1BQU0sRUFBRSxjQUFjO0FBQ3RCLFFBQUEsWUFBWSxFQUFFLElBQUk7QUFDbkIsS0FBQTtBQUNELElBQUE7QUFDRSxRQUFBLEVBQUUsRUFBRSw2QkFBNkI7QUFDakMsUUFBQSxJQUFJLEVBQUUsdUJBQXVCO1FBQzdCLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWTtBQUN2QixRQUFBLE1BQU0sRUFBRSxvQkFBb0I7QUFDNUIsUUFBQSxZQUFZLEVBQUUsSUFBSTtBQUNuQixLQUFBO0FBQ0QsSUFBQTs7O0FBR0UsUUFBQSxFQUFFLEVBQUUsNEJBQTRCO0FBQ2hDLFFBQUEsSUFBSSxFQUFFLHdCQUF3QjtRQUM5QixJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDeEIsUUFBQSxNQUFNLEVBQUUsaUJBQWlCO0FBQ3pCLFFBQUEsWUFBWSxFQUFFLElBQUk7QUFDbkIsS0FBQTtBQUNELElBQUE7QUFDRSxRQUFBLEVBQUUsRUFBRSw2QkFBNkI7QUFDakMsUUFBQSxJQUFJLEVBQUUsdUJBQXVCO1FBQzdCLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVztBQUN0QixRQUFBLE1BQU0sRUFBRSxhQUFhO0FBQ3JCLFFBQUEsWUFBWSxFQUFFLElBQUk7QUFDbkIsS0FBQTtBQUNELElBQUE7QUFDRSxRQUFBLEVBQUUsRUFBRSxrQ0FBa0M7QUFDdEMsUUFBQSxJQUFJLEVBQUUsc0RBQXNEO1FBQzVELElBQUksRUFBRSxJQUFJLENBQUMsZ0JBQWdCO0FBQzNCLFFBQUEsTUFBTSxFQUFFLG9CQUFvQjtBQUM1QixRQUFBLFlBQVksRUFBRSxJQUFJO0FBQ25CLEtBQUE7QUFDRCxJQUFBO0FBQ0UsUUFBQSxFQUFFLEVBQUUseUNBQXlDO0FBQzdDLFFBQUEsSUFBSSxFQUFFLDBDQUEwQztRQUNoRCxJQUFJLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtBQUMzQixRQUFBLE1BQU0sRUFBRSxvQkFBb0I7QUFDNUIsUUFBQSxZQUFZLEVBQUUsSUFBSTtBQUNsQixRQUFBLFdBQVcsRUFBRSxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRTtBQUMvQyxLQUFBO0FBQ0QsSUFBQTtBQUNFLFFBQUEsRUFBRSxFQUFFLDJCQUEyQjtBQUMvQixRQUFBLElBQUksRUFBRSxxQkFBcUI7UUFDM0IsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTO0FBQ3BCLFFBQUEsTUFBTSxFQUFFLE9BQU87QUFDZixRQUFBLFlBQVksRUFBRSxJQUFJO0FBQ25CLEtBQUE7Q0FDRixDQUFDO0FBRW1CLE1BQUEsa0JBQW1CLFNBQVFXLGVBQU0sQ0FBQTtBQUdwRCxJQUFBLE1BQU0sTUFBTSxHQUFBO0FBQ1YsUUFBQSxNQUFNLE9BQU8sR0FBRyxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9DLFFBQUEsTUFBTSxPQUFPLENBQUMseUJBQXlCLEVBQUUsQ0FBQztBQUMxQyxRQUFBLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBRXZCLFFBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDeEUsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFMUUsUUFBQSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEtBQUk7QUFDL0QsWUFBQSxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztBQUM1RCxTQUFDLENBQUMsQ0FBQztLQUNKO0lBRUQsUUFBUSxHQUFBO0FBQ04sUUFBQSxJQUFJLENBQUMsa0NBQWtDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDaEQ7SUFFRCxlQUFlLENBQ2IsRUFBVSxFQUNWLElBQVksRUFDWixJQUFVLEVBQ1YsTUFBZSxFQUNmLFdBQW1DLEVBQUE7UUFFbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUNkLEVBQUU7WUFDRixJQUFJO0FBQ0osWUFBQSxJQUFJLEVBQUUsTUFBTTtBQUNaLFlBQUEsYUFBYSxFQUFFLENBQUMsUUFBUSxLQUFJO2dCQUMxQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQzdEO0FBQ0YsU0FBQSxDQUFDLENBQUM7S0FDSjtJQUVELDBCQUEwQixHQUFBOztBQUV4QixRQUFBLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUk7QUFDNUIsWUFBQSxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQzVCLFlBQUEsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDM0IsU0FBQyxDQUFDLENBQUM7O1FBR0gsTUFBTSxpQkFBaUIsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUMzQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUk7QUFDWixZQUFBLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFlBQUEsT0FBTyxHQUFHLENBQUM7U0FDWixFQUNELEVBQXFDLENBQ3RDLENBQUM7UUFFRixJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sS0FBSTtZQUNyRCxNQUFNLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUU5QyxJQUFJLElBQUksRUFBRTtBQUNSLGdCQUFBLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBSztvQkFDbEUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUMsaUJBQUMsQ0FBQyxDQUFDO2FBQ0o7QUFDSCxTQUFDLENBQUMsQ0FBQztLQUNKO0FBRUQsSUFBQSxrQkFBa0IsQ0FDaEIsSUFBVSxFQUNWLFVBQW1CLEVBQ25CLFdBQW1DLEVBQUE7OztRQUluQyxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDVixZQUFBLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2YsWUFBQSxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztTQUNyQztBQUVELFFBQUEsT0FBTyxJQUFJLENBQUM7S0FDYjtBQUVELElBQUEsa0NBQWtDLENBQUMsU0FBa0IsRUFBQTtRQUNuRCxJQUFJLFNBQVMsRUFBRTtZQUNiLE1BQU0sZUFBZSxHQUFHLE1BQUs7Z0JBQzNCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFVBQStCLENBQUM7QUFDL0UsZ0JBQUEsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUVsQyxJQUFJLFFBQVEsRUFBRTtBQUNaLG9CQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQzFDO0FBQ0gsYUFBQyxDQUFDO0FBRUYsWUFBQSxjQUFjLENBQUMsNkJBQTZCLENBQzFDLElBQUksQ0FBQyxHQUFHLEVBQ1IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQzNCLGVBQWUsQ0FDaEIsQ0FBQztTQUNIO2FBQU07WUFDTCxjQUFjLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztTQUMvQztLQUNGO0FBQ0Y7Ozs7IiwieF9nb29nbGVfaWdub3JlTGlzdCI6WzRdfQ==
