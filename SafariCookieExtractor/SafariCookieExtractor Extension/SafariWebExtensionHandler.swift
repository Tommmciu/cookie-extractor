//
//  SafariWebExtensionHandler.swift
//  SafariCookieExtractor Extension
//

import SafariServices
import AppKit

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    func beginRequest(with context: NSExtensionContext) {
        let item = context.inputItems.first as? NSExtensionItem
        let message = item?.userInfo?[SFExtensionMessageKey]

        guard let dict = message as? [String: Any],
              let text = dict["text"] as? String else {
            complete(context: context, success: false)
            return
        }

        NSPasteboard.general.clearContents()
        let success = NSPasteboard.general.setString(text, forType: .string)
        complete(context: context, success: success)
    }

    private func complete(context: NSExtensionContext, success: Bool) {
        let response = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: ["success": success]]
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
}
