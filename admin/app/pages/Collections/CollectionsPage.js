import {Router} from '../../Router';
import {Page} from '../../Core';
import Template from './CollectionsPage.ejs';
import Placeholder from './Placeholder.ejs';

Router.on('/collections', () => {

    Page.setContent(Template());

});