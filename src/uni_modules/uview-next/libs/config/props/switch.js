/*
 * @Author       : LQ
 * @Description  :
 * @version      : 1.0
 * @Date         : 2021-08-20 16:44:21
 * @LastAuthor   : LQ
 * @lastTime     : 2021-08-20 17:22:24
 * @FilePath     : /u-view2.0/uview-ui/libs/config/props/switch.js
 */

import theme from '../theme.js'

export default {
    // switch
    switch: {
        loading: false,
        disabled: false,
        size: 25,
        activeColor: theme.primary,
        inactiveColor: theme.bgColor,
        value: false,
        activeValue: true,
        inactiveValue: false,
        asyncChange: false,
        space: 0
    }
}
