package com.liferay.fbo.patch.commerce.context.layout.reindex;

import com.liferay.commerce.constants.CommerceWebKeys;
import com.liferay.commerce.context.CommerceContext;
import com.liferay.commerce.context.CommerceContextFactory;
import com.liferay.commerce.product.model.CommerceChannel;
import com.liferay.commerce.product.service.CommerceChannelLocalService;
import com.liferay.commerce.util.CommerceContextThreadLocal;
import com.liferay.commerce.util.CommerceGroupThreadLocal;
import com.liferay.layout.content.LayoutContentProvider;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.WebKeys;

import java.util.Locale;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * @author Fabian Bouché
 */
@Component(
	property = "service.ranking:Integer=1000",
	service = LayoutContentProvider.class
)
public class CustomLayoutContentProviderImpl implements LayoutContentProvider {

	@Override
	public String getLayoutContent(
		HttpServletRequest httpServletRequest,
		HttpServletResponse httpServletResponse,
		Layout layout,
		Locale locale) {

		if ((httpServletRequest == null) || (httpServletResponse == null) || (layout == null)) {
			return _originalLayoutContentProvider.getLayoutContent(
				httpServletRequest, httpServletResponse, layout, locale);
		}

		ThemeDisplay themeDisplay =
			(ThemeDisplay)httpServletRequest.getAttribute(WebKeys.THEME_DISPLAY);

		if (themeDisplay == null) {
			return _originalLayoutContentProvider.getLayoutContent(
				httpServletRequest, httpServletResponse, layout, locale);
		}

		CommerceContext previousCommerceContext = CommerceContextThreadLocal.get();
		Group previousCommerceGroup = CommerceGroupThreadLocal.get();
		Object previousCommerceContextAttribute = httpServletRequest.getAttribute(
			CommerceWebKeys.COMMERCE_CONTEXT);

		Layout previousRequestLayout =
			(Layout)httpServletRequest.getAttribute(WebKeys.LAYOUT);

		HttpServletRequest previousThemeDisplayRequest = themeDisplay.getRequest();
		Layout previousThemeDisplayLayout = themeDisplay.getLayout();
		long previousThemeDisplayPlid = themeDisplay.getPlid();
		Locale previousThemeDisplayLocale = themeDisplay.getLocale();
		String previousThemeDisplayLanguageId = themeDisplay.getLanguageId();

		boolean initializedCommerceContext = false;

		try {
			if (previousCommerceContext == null) {
				httpServletRequest.setAttribute(WebKeys.LAYOUT, layout);

				themeDisplay.setLayout(layout);
				themeDisplay.setPlid(layout.getPlid());
				themeDisplay.setLocale(locale);
				themeDisplay.setLanguageId(LocaleUtil.toLanguageId(locale));
				themeDisplay.setRequest(httpServletRequest);

				CommerceChannel commerceChannel =
					_commerceChannelLocalService.fetchCommerceChannelBySiteGroupId(
						layout.getGroupId());

				if (commerceChannel != null) {
					CommerceContext commerceContext =
						_commerceContextFactory.create(httpServletRequest);

					httpServletRequest.setAttribute(
						CommerceWebKeys.COMMERCE_CONTEXT, commerceContext);

					CommerceContextThreadLocal.set(commerceContext);

					Group commerceGroup = _groupLocalService.fetchGroup(
						commerceChannel.getGroupId());

					CommerceGroupThreadLocal.set(commerceGroup);

					initializedCommerceContext = true;

					if (_log.isDebugEnabled()) {
						_log.debug(
							"Initialized CommerceContext for layout " +
								layout.getPlid() + " and groupId " +
								layout.getGroupId());
					}
				}
			}

			return _originalLayoutContentProvider.getLayoutContent(
				httpServletRequest, httpServletResponse, layout, locale);
		}
		catch (Exception exception) {
			_log.error(
				"Unable to render layout content for layout " + layout.getPlid(),
				exception);

			return _originalLayoutContentProvider.getLayoutContent(
				httpServletRequest, httpServletResponse, layout, locale);
		}
		finally {
			if (previousRequestLayout != null) {
				httpServletRequest.setAttribute(WebKeys.LAYOUT, previousRequestLayout);
			}
			else {
				httpServletRequest.removeAttribute(WebKeys.LAYOUT);
			}

			themeDisplay.setLayout(previousThemeDisplayLayout);
			themeDisplay.setPlid(previousThemeDisplayPlid);
			themeDisplay.setLocale(previousThemeDisplayLocale);
			themeDisplay.setLanguageId(previousThemeDisplayLanguageId);
			themeDisplay.setRequest(previousThemeDisplayRequest);

			if (previousCommerceContextAttribute != null) {
				httpServletRequest.setAttribute(
					CommerceWebKeys.COMMERCE_CONTEXT,
					previousCommerceContextAttribute);
			}
			else {
				httpServletRequest.removeAttribute(
					CommerceWebKeys.COMMERCE_CONTEXT);
			}

			if (initializedCommerceContext) {
				CommerceContextThreadLocal.set(previousCommerceContext);
				CommerceGroupThreadLocal.set(previousCommerceGroup);
			}
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		CustomLayoutContentProviderImpl.class);

	@Reference(
		target = "(component.name=com.liferay.layout.internal.content.LayoutContentProviderImpl)",
		unbind = "-"
	)
	private LayoutContentProvider _originalLayoutContentProvider;

	@Reference
	private CommerceChannelLocalService _commerceChannelLocalService;

	@Reference
	private CommerceContextFactory _commerceContextFactory;

	@Reference
	private GroupLocalService _groupLocalService;
}